import { ref, computed } from 'vue';

const STORAGE_KEY = 'kimi-chat-history';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadChats() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return raw.map((c) => ({
      ...c,
      messages: c.messages || [],
      createdAt: c.createdAt || Date.now(),
    }));
  } catch {
    return [];
  }
}

function saveChats(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function pickOrbState(message) {
  const lower = message.toLowerCase();
  if (/\b(search|look up|find|google|browse|web|internet)\b/.test(lower)) {
    return 'searching';
  }
  if (/\b(solve|calculate|code|debug|program|math|equation|algorithm|work|build|create|write)\b/.test(lower)) {
    return 'solving';
  }
  return 'composing';
}

export function useChat() {
  const chats = ref(loadChats());
  const activeChatId = ref(chats.value[0]?.id || null);
  const isLoading = ref(false);
  const abortController = ref(null);
  const orbState = ref('working');

  const activeChat = computed(() =>
    chats.value.find((c) => c.id === activeChatId.value)
  );

  function persist() {
    saveChats(chats.value);
  }

  function createChat() {
    const chat = {
      id: generateId(),
      title: 'New chat',
      messages: [],
      createdAt: Date.now(),
    };
    chats.value.unshift(chat);
    activeChatId.value = chat.id;
    persist();
    return chat;
  }

  function selectChat(id) {
    activeChatId.value = id;
  }

  function deleteChat(id) {
    chats.value = chats.value.filter((c) => c.id !== id);
    if (activeChatId.value === id) {
      activeChatId.value = chats.value[0]?.id || null;
    }
    persist();
  }

  function updateTitle(chat, firstMessage) {
    const text = firstMessage.trim();
    chat.title = text.slice(0, 40) || 'New chat';
    if (text.length > 40) chat.title += '…';
  }

  async function sendMessage(content, { apiKey, model }) {
    orbState.value = pickOrbState(content);
    if (!activeChat.value) createChat();
    const chat = activeChat.value;

    chat.messages.push({ role: 'user', content });
    if (chat.messages.length === 1) updateTitle(chat, content);
    persist();

    isLoading.value = true;
    abortController.value = new AbortController();

    try {
      const res = await fetch('https://api.moonshot.ai/v1/chat/completions', {
        method: 'POST',
        signal: abortController.value.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          messages: [
            {
              role: 'system',
              content:
                'You are Kimi, an AI assistant provided by Moonshot AI. You are especially good at conversations in Chinese and English. You provide users with safe, helpful, and accurate answers.',
            },
            ...chat.messages.slice(-20).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error?.message || `HTTP ${res.status}`);
      }

      chat.messages.push({ role: 'assistant', content: '', isStreaming: true });
      const assistantMessage = chat.messages[chat.messages.length - 1];

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta?.content;
            if (delta) {
              assistantMessage.content += delta;
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }
      assistantMessage.isStreaming = false;
    } catch (err) {
      if (err.name !== 'AbortError') {
        const last = chat.messages[chat.messages.length - 1];
        if (last && last.role === 'assistant' && last.isStreaming) {
          last.content = `Error: ${err.message}`;
          last.isError = true;
          last.isStreaming = false;
        } else {
          chat.messages.push({
            role: 'assistant',
            content: `Error: ${err.message}`,
            isError: true,
          });
        }
      }
    } finally {
      isLoading.value = false;
      abortController.value = null;
      persist();
    }
  }

  function stop() {
    abortController.value?.abort();
  }

  return {
    chats,
    activeChat,
    activeChatId,
    isLoading,
    orbState,
    createChat,
    selectChat,
    deleteChat,
    sendMessage,
    stop,
  };
}

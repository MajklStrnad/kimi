<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { marked } from 'marked';
import VueThinkingOrb from './VueThinkingOrb.vue';
import ChatInput from './ChatInput.vue';

const props = defineProps({
  chat: { type: Object, default: null },
  isLoading: { type: Boolean, default: false },
  orbState: { type: String, default: 'working' },
  model: { type: String, default: '' },
  models: { type: Array, default: () => [] },
  modelName: { type: String, default: '' },
});

defineEmits(['send', 'stop', 'new', 'open-sidebar', 'update:model']);

const scrollRef = ref(null);

const messages = computed(() => props.chat?.messages || []);

watch(
  () => messages.value.length,
  async () => {
    await nextTick();
    scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'smooth' });
  }
);

watch(
  () => props.isLoading,
  async () => {
    await nextTick();
    scrollRef.value?.scrollTo({ top: scrollRef.value.scrollHeight, behavior: 'smooth' });
  }
);

function renderMarkdown(content) {
  return marked.parse(content, { breaks: true });
}
</script>

<template>
  <main class="main">
    <header class="topbar">
      <button class="menu-btn" @click="$emit('open-sidebar')" aria-label="Open sidebar">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <div class="topbar-center">
        <div class="title">Kimi Chat</div>
        <div class="model">{{ modelName }}</div>
      </div>
      <button class="new-btn" @click="$emit('new')" aria-label="New chat">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </header>

    <div class="messages" ref="scrollRef">
      <template v-if="chat">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role, { error: msg.isError }]"
        >
          <div class="avatar">
            <svg v-if="msg.role === 'user'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <div class="bubble">
            <template v-if="msg.isStreaming">
              <div class="streaming-text">{{ msg.content }}</div>
              <div v-if="!msg.content" class="orb-inline">
                <VueThinkingOrb :state="orbState" :size="20" theme="auto" :aria-label="'Kimi is ' + orbState" />
              </div>
            </template>
            <template v-else>
              <div class="markdown" v-html="renderMarkdown(msg.content)"></div>
            </template>
          </div>
        </div>
      </template>

      <div v-else class="empty-state">
        <h1>What can I help with?</h1>
        <p>Paste your API key in Settings, then start a new chat.</p>
      </div>
    </div>

    <ChatInput
      :disabled="isLoading"
      :model="model"
      :models="models"
      @send="$emit('send', $event)"
      @stop="$emit('stop')"
      @update:model="$emit('update:model', $event)"
    />
  </main>
</template>

<style scoped>
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg);
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.menu-btn,
.new-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.menu-btn:hover,
.new-btn:hover {
  background: var(--surface-2);
  color: var(--text);
}

@media (min-width: 768px) {
  .menu-btn {
    display: none;
  }
}

.topbar-center {
  text-align: center;
}

.title {
  font-weight: 600;
  font-size: 0.95rem;
}

.model {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.message.user {
  flex-direction: row-reverse;
}

.avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-2);
  color: var(--text-secondary);
}

.message.user .avatar {
  background: var(--accent);
  color: var(--accent-text);
}

.bubble {
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  max-width: calc(100% - 56px);
  overflow-wrap: break-word;
}

.message.user .bubble {
  background: var(--accent);
  color: var(--accent-text);
}

.message.error .bubble {
  background: rgba(220, 38, 38, 0.08);
  color: var(--danger);
}

.streaming-text {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  line-height: 1.6;
}

.orb-inline {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
}

.empty-state h1 {
  margin: 0 0 0.5rem;
  color: var(--text);
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
}
</style>

<script setup>
defineProps({
  chats: { type: Array, required: true },
  activeId: { type: String, default: null },
});

defineEmits(['select', 'new', 'delete', 'toggle-settings', 'toggle-sidebar']);

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
</script>

<template>
  <aside class="sidebar">
    <div class="header">
      <button class="new-chat" @click="$emit('new')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        New chat
      </button>
      <button class="icon-btn close" @click="$emit('toggle-sidebar')" aria-label="Close sidebar">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="chat-list">
      <button
        v-for="chat in chats"
        :key="chat.id"
        :class="['chat-item', { active: chat.id === activeId }]"
        @click="$emit('select', chat.id)"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span class="title">{{ chat.title }}</span>
        <button
          class="delete-btn"
          @click.stop="$emit('delete', chat.id)"
          aria-label="Delete chat"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
        <span class="date">{{ formatDate(chat.createdAt) }}</span>
      </button>

      <div v-if="!chats.length" class="empty">No chats yet</div>
    </div>

    <div class="footer">
      <button class="settings-btn" @click="$emit('toggle-settings')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Settings
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.header {
  padding: 0.75rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.new-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--accent-text);
  font-weight: 500;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.icon-btn:hover {
  background: var(--surface-2);
  color: var(--text);
}

.close {
  display: flex;
}

@media (min-width: 768px) {
  .close {
    display: none;
  }
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.chat-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-align: left;
  transition: background 0.15s;
}

.chat-item:hover,
.chat-item.active {
  background: var(--surface-2);
  color: var(--text);
}

.chat-item.active {
  font-weight: 500;
}

.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  grid-column: 3;
  font-size: 0.75rem;
  opacity: 0.7;
}

.delete-btn {
  display: none;
  color: var(--text-secondary);
  padding: 0.2rem;
  border-radius: 4px;
}

.chat-item:hover .delete-btn {
  display: block;
}

.delete-btn:hover {
  color: var(--danger);
  background: rgba(220, 38, 38, 0.1);
}

.empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.footer {
  padding: 0.75rem;
  border-top: 1px solid var(--border);
}

.settings-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.settings-btn:hover {
  background: var(--surface-2);
  color: var(--text);
}
</style>

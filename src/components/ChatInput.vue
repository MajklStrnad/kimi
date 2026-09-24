<script setup>
import { ref } from 'vue';

const props = defineProps({
  disabled: { type: Boolean, default: false },
  model: { type: String, default: '' },
  models: { type: Array, default: () => [] },
});

const emit = defineEmits(['send', 'stop', 'update:model']);

const text = ref('');
const inputRef = ref(null);

function submit() {
  const value = text.value.trim();
  if (!value || props.disabled) return;
  emit('send', value);
  text.value = '';
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submit();
  }
}
</script>

<template>
  <div class="input-area">
    <div class="input-box">
      <textarea
        ref="inputRef"
        v-model="text"
        placeholder="Message Kimi…"
        rows="1"
        :disabled="disabled"
        @keydown="onKeydown"
      ></textarea>
      <button
        v-if="disabled"
        class="send-btn stop"
        @click="$emit('stop')"
        aria-label="Stop generating"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </button>
      <button
        v-else
        class="send-btn"
        :disabled="!text.trim()"
        @click="submit"
        aria-label="Send message"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
    <div class="input-meta">
      <select
        class="model-select"
        :value="model"
        @change="$emit('update:model', $event.target.value)"
      >
        <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
      <span class="hint">Enter to send, Shift+Enter for new line</span>
    </div>
  </div>
</template>

<style scoped>
.input-area {
  padding: 0.75rem 1rem 1rem;
  background: var(--bg);
  border-top: 1px solid var(--border);
}

.input-box {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.input-box textarea {
  flex: 1;
  min-height: 40px;
  max-height: 160px;
  border: none;
  background: transparent;
  padding: 0.5rem;
  resize: none;
}

.input-box textarea:focus {
  border: none;
  outline: none;
}

.send-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--accent-text);
  transition: opacity 0.15s;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn.stop {
  background: var(--surface-2);
  color: var(--text);
}

.input-meta {
  max-width: 900px;
  margin: 0.4rem auto 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.model-select {
  width: auto;
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.hint {
  font-size: 0.7rem;
  color: var(--text-secondary);
}
</style>

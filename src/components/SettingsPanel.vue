<script setup>
const props = defineProps({
  apiKey: { type: String, required: true },
  model: { type: String, required: true },
  theme: { type: String, required: true },
  models: { type: Array, required: true },
});

const emit = defineEmits(['close', 'update:apiKey', 'update:model', 'update:theme']);

const THEMES = [
  { id: 'auto', name: 'Auto' },
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
];
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <header class="modal-header">
        <h2>Settings</h2>
        <button class="close-btn" @click="$emit('close')" aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div class="form">
        <label class="field">
          <span class="label">API Key</span>
          <input
            type="password"
            :value="apiKey"
            @input="$emit('update:apiKey', $event.target.value)"
            placeholder="sk-..."
            autocomplete="off"
          />
          <span class="help">Stored in your browser's localStorage.</span>
        </label>

        <label class="field">
          <span class="label">Model</span>
          <select :value="model" @change="$emit('update:model', $event.target.value)">
            <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </label>

        <label class="field">
          <span class="label">Theme</span>
          <select :value="theme" @change="$emit('update:theme', $event.target.value)">
            <option v-for="t in THEMES" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </label>
      </div>

      <footer class="modal-footer">
        <button class="done-btn" @click="$emit('close')">Done</button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  display: flex;
  color: var(--text-secondary);
  padding: 0.25rem;
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  background: var(--surface-2);
  color: var(--text);
}

.form {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.help {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.8;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
}

.done-btn {
  padding: 0.55rem 1.25rem;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--accent-text);
  font-weight: 500;
}
</style>

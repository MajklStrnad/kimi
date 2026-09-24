import { ref, watch } from 'vue';

const STORAGE_KEY = 'kimi-chat-settings';

const MODELS = [
  { id: 'kimi-k3', name: 'Kimi K3' },
  { id: 'kimi-k2.7-code-highspeed', name: 'Kimi K2.7 Code (fast)' },
  { id: 'kimi-k2.6', name: 'Kimi K2.6' },
];

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

const saved = load();

export function useSettings() {
  const apiKey = ref(saved.apiKey || '');
  const model = ref(saved.model || MODELS[0].id);
  const theme = ref(saved.theme || 'auto');

  watch(
    () => ({ apiKey: apiKey.value, model: model.value, theme: theme.value }),
    (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
    { deep: true }
  );

  watch(
    theme,
    (value) => {
      const root = document.documentElement;
      if (value === 'dark') root.setAttribute('data-theme', 'dark');
      else if (value === 'light') root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
    },
    { immediate: true }
  );

  return { apiKey, model, theme, MODELS };
}

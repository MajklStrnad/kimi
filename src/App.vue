<script setup>
import { ref } from 'vue';
import { useSettings } from './composables/useSettings.js';
import { useChat } from './composables/useChat.js';
import ChatSidebar from './components/ChatSidebar.vue';
import ChatMain from './components/ChatMain.vue';
import SettingsPanel from './components/SettingsPanel.vue';

const { apiKey, model, theme, MODELS } = useSettings();
const { chats, activeChat, activeChatId, isLoading, orbState, createChat, selectChat, deleteChat, sendMessage, stop } = useChat();

const showSettings = ref(false);
const sidebarOpen = ref(false);
</script>

<template>
  <div class="app">
    <ChatSidebar
      :chats="chats"
      :active-id="activeChatId"
      @select="selectChat"
      @new="createChat"
      @delete="deleteChat"
      @toggle-settings="showSettings = true"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      :class="['sidebar', { open: sidebarOpen }]"
    />
    <div class="overlay" v-if="sidebarOpen" @click="sidebarOpen = false"></div>
    <ChatMain
      :chat="activeChat"
      :is-loading="isLoading"
      :orb-state="orbState"
      :model="model"
      :models="MODELS"
      :model-name="MODELS.find((m) => m.id === model)?.name || model"
      @send="sendMessage($event, { apiKey, model })"
      @stop="stop"
      @new="createChat"
      @update:model="model = $event"
      @open-sidebar="sidebarOpen = true"
    />
    <SettingsPanel
      v-if="showSettings"
      v-model:api-key="apiKey"
      v-model:model="model"
      v-model:theme="theme"
      :models="MODELS"
      @close="showSettings = false"
    />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 20;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
}

.sidebar.open {
  transform: translateX(0);
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 15;
}

@media (min-width: 768px) {
  .sidebar {
    position: relative;
    transform: none;
    transition: none;
  }

  .overlay {
    display: none;
  }
}
</style>

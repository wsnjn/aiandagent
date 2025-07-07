<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <div class="sidebar-header">
      <div class="sidebar-logo" v-if="!isSidebarCollapsed">牛迦楠个人项目</div>
      <button class="sidebar-toggle" @click="isSidebarCollapsed = !isSidebarCollapsed" title="折叠/展开">
        <span>{{ isSidebarCollapsed ? '➡️' : '⬅️' }}</span>
      </button>
    </div>
    <nav class="sidebar-menu">
      <router-link to="/home" class="menu-item" :class="{ active: $route.path === '/home' }">
        <span class="menu-icon">🏠</span>
        <span class="menu-text" v-if="!isSidebarCollapsed">首页</span>
      </router-link>
      <router-link to="/chat" class="menu-item" :class="{ active: $route.path === '/chat' }">
        <span class="menu-icon">💬</span>
        <span class="menu-text" v-if="!isSidebarCollapsed">聊天</span>
      </router-link>
      <router-link to="/chat-history" class="menu-item" :class="{ active: $route.path === '/chat-history' }">
        <span class="menu-icon">⏱️</span>
        <span class="menu-text" v-if="!isSidebarCollapsed">历史记录</span>
      </router-link>
      <router-link to="/article" class="menu-item" :class="{ active: $route.path === '/article' }">
        <span class="menu-icon">◼️</span>
        <span class="menu-text" v-if="!isSidebarCollapsed">文章</span>
      </router-link>
      <router-link to="/articles-watch" class="menu-item" :class="{ active: $route.path === '/articles-watch' }">
        <span class="menu-icon">📰</span>
        <span class="menu-text" v-if="!isSidebarCollapsed">论坛</span>
      </router-link>
      <!-- 功能 二级菜单 -->
      <div class="menu-item submenu-parent" @click="showFunctionSub = !showFunctionSub">
        <span class="menu-icon">🛠️</span>
        <span class="menu-text" v-if="!isSidebarCollapsed">功能</span>
        <span class="submenu-arrow" v-if="!isSidebarCollapsed">{{ showFunctionSub ? '▲' : '▼' }}</span>
      </div>
      <transition name="submenu-fade">
        <div v-if="showFunctionSub && !isSidebarCollapsed" class="submenu">
          <router-link to="/ptow" class="submenu-item" :class="{ active: $route.path === '/ptow' }">
            <span class="menu-icon">📄</span>
            <span class="menu-text">PDF转Word</span>
          </router-link>
          <router-link to="/cloud" class="submenu-item" :class="{ active: $route.path === '/cloud' }">
            <span class="menu-icon">☁️</span>
            <span class="menu-text">个人网盘</span>
          </router-link>
          <router-link to="/tts" class="submenu-item" :class="{ active: $route.path === '/tts' }">
            <span class="menu-icon">🔊</span>
            <span class="menu-text">TTS语音</span>
          </router-link>
        </div>
      </transition>
      <!-- 个人设置 二级菜单 -->
      <div class="menu-item submenu-parent" @click="showProfileSub = !showProfileSub">
        <span class="menu-icon">👤</span>
        <span class="menu-text" v-if="!isSidebarCollapsed">个人设置</span>
        <span class="submenu-arrow" v-if="!isSidebarCollapsed">{{ showProfileSub ? '▲' : '▼' }}</span>
      </div>
      <transition name="submenu-fade">
        <div v-if="showProfileSub && !isSidebarCollapsed" class="submenu">
          <router-link to="/profile" class="submenu-item" :class="{ active: $route.path === '/profile' }">
            <span class="menu-icon">👤</span>
            <span class="menu-text">个人信息</span>
          </router-link>
        </div>
      </transition>
    </nav>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const isSidebarCollapsed = ref(false)
const showFunctionSub = ref(false)
const showProfileSub = ref(false)
</script>
<script>
export default {
  name: 'SidebarMenu'
}
</script>
<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
  color: #fff;
  transition: width 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s;
  box-shadow: 2px 0 12px 0 rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
}
.sidebar-collapsed {
  width: 60px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sidebar-logo {
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 2px;
  color: #ffd700;
}
.sidebar-toggle {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  outline: none;
  margin-left: 8px;
}
.sidebar-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  gap: 2px;
}
.menu-item, .submenu-parent {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-radius: 8px;
  margin: 2px 8px;
  cursor: pointer;
  font-size: 1rem;
  color: #fff;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  position: relative;
  user-select: none;
  text-decoration: none !important;
}
.menu-item.active, .submenu-item.active {
  background: rgba(255,255,255,0.13);
  color: #ffd700;
  box-shadow: 0 2px 8px 0 rgba(255,215,0,0.08);
}
.menu-item:hover, .submenu-parent:hover, .submenu-item:hover {
  background: rgba(255,255,255,0.08);
  color: #ffd700;
}
.menu-icon {
  font-size: 20px;
  margin-right: 14px;
  flex-shrink: 0;
  transition: margin 0.3s;
}
.menu-text {
  transition: opacity 0.3s, width 0.3s;
  white-space: nowrap;
}
.sidebar-collapsed .menu-text {
  opacity: 0;
  width: 0;
}
.sidebar-collapsed .sidebar-logo {
  display: none;
}
.sidebar-collapsed .submenu-arrow {
  display: none;
}
.submenu-parent {
  font-weight: 500;
  background: none;
  border: none;
  outline: none;
  margin-bottom: 0;
}
.submenu-arrow {
  margin-left: auto;
  font-size: 12px;
}
.submenu {
  display: flex;
  flex-direction: column;
  margin-left: 32px;
  gap: 2px;
  padding-left: 4px;
  border-left: 2px solid rgba(255,255,255,0.08);
  animation: submenu-in 0.3s;
}
@keyframes submenu-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.submenu-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.98rem;
  color: #fff;
  margin: 2px 0;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  text-decoration: none !important;
}
.submenu-fade-enter-active, .submenu-fade-leave-active {
  transition: opacity 0.3s;
}
.submenu-fade-enter-from, .submenu-fade-leave-to {
  opacity: 0;
}
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 100;
  }
}
</style>

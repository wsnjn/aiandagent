<!-- App.vue -->
<template>
  <div class="app-layout">
    <SidebarMenu />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import SidebarMenu from '@/components/Sidebar.vue'
// 你也可以在这里监听路由等操作
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}
.main-content {
  flex: 1;
  min-width: 0;
  background: #f8fafc;
}
/* 局部样式 */
</style>

<style>
/* 全局样式，清除默认边距和设置背景 */
html, body {
  margin: 0;
  padding: 0;
}
#app {
  height: 100%;
}
</style>

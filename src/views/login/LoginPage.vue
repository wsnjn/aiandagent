<template>
 <div><ThreeModelViewer @speech-recognized="handleSpeechRecognized" /></div>
  <div class="login-page">
    <form class="login-container" @submit.prevent="handleLogin">
      <h2 class="title">用户登录</h2>
      <input
        type="text"
        v-model="loginForm.username"
        placeholder="用户名"
        class="input"
        required
      />
      <input
        type="password"
        v-model="loginForm.password"
        placeholder="密码"
        class="input"
        required
      />
      <button type="submit" class="login-button">登录</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' // 导入用户状态管理
import ThreeModelViewer from '@/components/ThreeModelViewer.vue';

const router = useRouter()
const userStore = useUserStore() // 创建用户状态管理实例

const loginForm = ref({
  username: '',
  password: '',
})

/**
 * 处理登录逻辑
 */
function handleLogin() {
  // 验证表单
  if (!loginForm.value.username || !loginForm.value.password) {
    alert('用户名和密码不能为空')
    return
  }

  // 发送登录请求
  axios
    .post('http://localhost:3000/api/login', {
      username: loginForm.value.username,
      password: loginForm.value.password,
    })
    .then((response) => {
      // 打印完整的响应数据，用于调试
      console.log('登录成功，完整响应数据:', response.data);

      // 检查响应是否包含code字段，并且值为200（表示成功）
      if (response.data && response.data.code === 200) {
        // 打印从服务器返回的用户信息
        console.log('服务器返回的用户信息:', response.data.user);

        // 存储用户信息（不再存储token，因为使用直接传递userId的方案）
        userStore.setUserInfo(response.data.user);
        console.log('存储的用户信息:', response.data.user);

        // 跳转到首页
        router.push('/home')

        // 打印Pinia store中的用户信息，确认是否存储成功
        console.log('当前Pinia store中的用户信息:', userStore.userInfo);
      } else {
        // 如果code不是200，表示登录失败
        console.error('登录失败:', response.data.message || '未知错误');
        alert('登录失败，请检查用户名或密码');
      }
    })
    .catch((error) => {
      // 处理请求错误
      console.error('登录请求出错:', error);
      alert('登录失败，请检查网络连接或稍后再试');
    });
}
</script>

<style scoped>
/* 样式保持不变 */
.login-page {
  width: 100vw;
  height: 100vh;
  background: url('@/assets/1.png') no-repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  background: rgba(255, 255, 255, 0.1);
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  color: rgb(72, 133, 247);
  width: 300px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
}

.input {
  width: 90%;
  margin: 10px 0;
  padding: 10px;
  border: none;
  border-bottom: 1px solid white;
  background: transparent;
  color: rgb(0, 0, 0);
  font-size: 16px;
  outline: none;
}

.login-button {
  margin-top: 20px;
  width: 100%;
  padding: 10px;
  background-color: transparent;
  border: 1px solid #00d1ff;
  color: #00d1ff;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
}

.login-button:hover {
  background-color: #00d1ff;
  color: white;
}
</style>

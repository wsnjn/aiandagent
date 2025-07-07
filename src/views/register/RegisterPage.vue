<template>
    <div><ThreeModelViewer @speech-recognized="handleSpeechRecognized" /></div>
  <div class="register-page">
    <form class="register-container" @submit.prevent="handleRegister">
      <h2 class="title">用户注册</h2>
      <input
        type="text"
        v-model="registerForm.username"
        placeholder="用户名"
        class="input"
        required
      />
      <input
        type="password"
        v-model="registerForm.password"
        placeholder="密码"
        class="input"
        required
      />
      <input
        type="password"
        v-model="registerForm.confirmPassword"
        placeholder="确认密码"
        class="input"
        required
      />
      <button type="submit" class="register-button">注册</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import ThreeModelViewer from '@/components/ThreeModelViewer.vue';
const router = useRouter()

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

function handleRegister() {
  const { username, password, confirmPassword } = registerForm.value

  if (!username || !password || !confirmPassword) {
    alert('所有字段不能为空')
    return
  }

  if (password !== confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  axios
    .post('http://localhost:3000/api/register', {
      username,
      password,
    })
    .then((response) => {
      console.log('注册成功:', response.data)
      alert('注册成功，请登录')
      router.push('/login')
    })
    .catch((error) => {
      console.error('注册失败:', error)
      alert('注册失败，请重试')
    })
}
</script>

<style scoped>
.register-page {
  width: 100vw;
  height: 100vh;
  background: url('@/assets/1.png') no-repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.register-container {
  background: rgba(255, 255, 255, 0.1);
  padding: 40px 30px;
  border-radius: 12px;
  text-align: center;
  /* backdrop-filter: blur(8px); */
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

.register-button {
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

.register-button:hover {
  background-color: #00d1ff;
  color: white;
}
</style>

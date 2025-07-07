<template>
    <div><ThreeModelViewer @speech-recognized="handleSpeechRecognized" /></div>
  <div class="chat-history-container">
    <h2>聊天历史记录</h2>

    <div v-if="loading" class="loading">
      加载中...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="history.length === 0" class="empty-history">
      暂无聊天记录
    </div>

    <div v-else class="history-list">
      <div v-for="(item, index) in history" :key="index" class="history-item">
        <div class="history-question">
          <strong>问题：</strong> {{ item.question }}
        </div>
        <div class="history-answer">
          <strong>回答：</strong> {{ item.answer }}
        </div>
        <div class="history-time">
          <strong>时间：</strong> {{ formatDate(item.created_at) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import ThreeModelViewer from '@/components/ThreeModelViewer.vue';

const userStore = useUserStore();
const history = ref([]);
const loading = ref(true);
const error = ref(null);

// 格式化日期时间
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString(); // 根据浏览器设置格式化日期时间
};

// 获取聊天历史记录
const fetchChatHistory = async () => {
  try {
    // 从Pinia store获取当前用户ID
    const userId = userStore.userInfo?.id;

    if (!userId) {
      throw new Error('未获取到用户ID');
    }

    // 发送请求获取聊天历史记录
    const response = await axios.get(`http://localhost:3000/api/chat-history?userId=${userId}`);

    if (response.data.code === 200) {
      history.value = response.data.history;
    } else {
      throw new Error(response.data.message || '获取聊天历史记录失败');
    }
  } catch (err) {
    console.error('获取聊天历史记录出错:', err);
    error.value = err.message || '获取聊天历史记录失败';
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取聊天历史记录
onMounted(() => {
  fetchChatHistory();
});
</script>

<style scoped>
.chat-history-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: 100vh;
  height: 100vh;
  overflow: auto;
  box-sizing: border-box;
}

h2 {
  text-align: center;
  margin-bottom: 32px;
  font-size: 2.2rem;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: 1px;
}

.loading, .error, .empty-history {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.error {
  color: red;
}

.history-list {
  border: none;
  border-radius: 0;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.history-item {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(44,62,80,0.08);
  padding: 24px 28px;
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.2s, transform 0.2s;
}

.history-item:hover {
  box-shadow: 0 8px 32px rgba(44,62,80,0.16);
  transform: translateY(-2px) scale(1.01);
}

.history-item:last-child {
  border-bottom: none;
}

.history-question {
  margin-bottom: 10px;
  font-weight: bold;
  color: #1976d2;
  font-size: 1.1rem;
}

.history-answer {
  margin-bottom: 10px;
  background-color: #f5f5f5;
  padding: 10px 14px;
  border-radius: 6px;
  color: #333;
  font-size: 1.08rem;
}

.history-time {
  font-size: 0.98em;
  color: #888;
  margin-top: 6px;
}

@media (max-width: 900px) {
  .chat-history-container {
    padding: 16px 2vw;
    max-width: 100vw;
  }
  .history-item {
    padding: 14px 8px;
  }
}
</style>

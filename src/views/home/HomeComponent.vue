<template>
  <div>
    <div><ThreeModelViewer @speech-recognized="handleSpeechRecognized" /></div>
    <div class="container">
      <ModelViewer :currentModelName="currentModelName" />
      <div class="right-half">
        <div class="chat-header">
          <div class="header-content">
            <div class="header-avatar">
              <img :src="userInfo?.avatar || defaultAvatar" alt="" />
            </div>
            <div class="header-info">
              <h2>{{ userInfo?.username || '用户' }}</h2>
            </div>
          </div>
        </div>
        <div class="chat-container">
          <div class="chat-messages" ref="chatMessagesContainer">
            <h2>AI 聊天</h2>
            <div v-if="loading" class="message ai-message">
              <div class="typing-indicator">AI 正在思考中...</div>
            </div>
            <div v-if="error" class="message error-message">错误：{{ error }}</div>
            <div class="chat-history">
              <template v-for="(pair, idx) in qaHistory" :key="idx">
                <div class="message user-message">
                  <div class="message-content">
                    <div class="user-label">你</div>
                    <div class="message-text">{{ pair.question }}</div>
                  </div>
                </div>
                <div class="message ai-message">
                  <div class="message-content">
                    <div class="ai-label">AI</div>
                    <div class="message-text">{{ pair.answer }}</div>
                    <div class="speaker-icon" @click="toggleSpeakByPair(idx)">
                      {{ pair.isSpeaking ? '🔊' : '📢' }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div class="input-area">
            <input v-model="question" placeholder="请输入你的问题" @keyup.enter="handleSend" />
            <button @click="handleSend">发送</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import ThreeModelViewer from '@/components/ThreeModelViewer.vue'
import ModelViewer from '@/components/ModelViewer.vue'
import { useUserStore } from '@/stores/user'
import defaultAvatar from '@/assets/1.png'
import { playWithBackendTTS } from '@/services/tts.js' // 统一后端TTS服务

const userStore = useUserStore()
const userInfo = ref(userStore.userInfo)
const question = ref('')
const chatHistory = ref([])
const loading = ref(false)
const error = ref('')
const chatMessagesContainer = ref(null)
const currentModelName = ref('cute_home_robot.glb')

// 新增：问答历史，结构为[{question, answer, isSpeaking}]
const qaHistory = computed(() => {
  // chatHistory 可能是混合的user/ai消息，需配对
  const result = []
  for (let i = 0; i < chatHistory.value.length; i++) {
    if (chatHistory.value[i].role === 'user') {
      const question = chatHistory.value[i].content
      let answer = ''
      let isSpeaking = false
      if (chatHistory.value[i + 1] && chatHistory.value[i + 1].role === 'ai') {
        answer = chatHistory.value[i + 1].content
        isSpeaking = chatHistory.value[i + 1].isSpeaking
      }
      result.push({ question, answer, isSpeaking })
    }
  }
  return result
})
// 语音播放按钮按问答对索引
function toggleSpeakByPair(idx) {
  const aiIdx = chatHistory.value.findIndex((msg, i) => msg.role === 'ai' && Math.floor(i/2) === idx)
  if (aiIdx !== -1) toggleSpeak(aiIdx)
}

// 侧边栏相关状态
// const isSidebarCollapsed = ref(false) // 移除
// const showFunctionSub = ref(false) // 移除
// const showProfileSub = ref(false) // 移除

// 移除未使用的 isSpeaking 变量
// const isSpeaking = ref(false); // 这个变量不再需要

// 在组件挂载时获取用户信息（如果尚未获取）
onMounted(async () => {
  if (!userInfo.value) {
    userInfo.value = userStore.userInfo
  }
  // 加载历史聊天记录
  if (userInfo.value?.id) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/chat-history?userId=${userInfo.value.id}`
      )
      const data = await response.json()
      if (data.code === 200 && data.history) {
        const reversedHistory = [...data.history].reverse()
        chatHistory.value = []
        reversedHistory.forEach(record => {
          if (record.question) {
            chatHistory.value.push({
              role: 'user',
              content: record.question,
              isSpeaking: false,
            })
          }
          if (record.answer) {
            chatHistory.value.push({
              role: 'ai',
              content: record.answer,
              isSpeaking: false,
            })
          }
        })
      }
    } catch (e) {
      console.error('加载历史记录失败:', e)
      error.value = '加载聊天历史失败'
    }
  }
  await nextTick()
  scrollToBottom()
})

// 保证每次聊天历史变化后自动滚动到底部
watch(chatHistory, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

// 直接调用后端TTS接口生成并播放语音，补全参数
const speak = async (text) => {
  try {
    await playWithBackendTTS(text, { per: 0, spd: 5, pit: 5, vol: 5 })
  } catch (error) {
    console.error('语音播放失败:', error)
    // 回退到浏览器原生API（可选）
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      utterance.rate = 1
      window.speechSynthesis.speak(utterance)
    } else {
      console.error('当前浏览器不支持语音合成')
    }
  }
}

// 切换朗读/暂停状态（ElevenLabs不支持暂停，这里只能重新播放或不做任何操作）
const toggleSpeak = async (msgIndex) => {
  const msg = chatHistory.value[msgIndex]
  if (msg && msg.role === 'ai') {
    // 直接调用speak函数，不需要检查isSpeaking
    await speak(msg.content, msgIndex)
  }
}

// 处理从3D模型组件识别到的语音
function handleSpeechRecognized(text) {
  console.log('Received speech:', text)
  // 指令控制模型切换
  if (text.includes('笑一笑')) {
    currentModelName.value = 'cute_home_robot.glb'
    return // 是指令，不发给AI
  } else if (text.includes('小狗')) {
    currentModelName.value = 'shiba.glb'
    return // 是指令，不发给AI
  }
  // 非指令才发给AI
  question.value = text
  handleSend()
}

// 修改getAIAnswer函数（保持不变）
async function getAIAnswer(q, messagesForAI) {
  console.log('准备发送AI回答请求 - 问题:', q)
  // 准备消息历史 - 包含完整的聊天历史（从旧到新）
  const messages = [
    { role: 'system', content: '你是一个有帮助的AI助手。' },
    ...messagesForAI, // 使用从旧到新的历史记录
    { role: 'user', content: q },
  ]
  try {
    const response = await fetch('http://localhost:3000/api/deepseek-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
    console.log('收到AI回答的响应 - 状态码:', response.status)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'API请求失败')
    }
    const data = await response.json()
    return data.choices[0].message.content
  } catch (e) {
    console.error('AI回答失败:', e)
    return '抱歉，我暂时无法回答这个问题。请稍后再试。'
  }
}

// 保存聊天记录
async function saveChatHistory(q, a) {
  // 获取当前用户的ID - 确保不为undefined
  const userId = userStore.userInfo?.id
  if (!userId) {
    const errorMsg = '无法保存聊天记录：用户未登录或用户ID无效'
    console.error(errorMsg)
    throw new Error(errorMsg)
  }
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`, // 添加认证头
      },
      body: JSON.stringify({
        question: q,
        answer: a,
        userId: Number(userId), // 确保是数字类型
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      console.error('保存失败详情:', data)
      throw new Error(data.message || '保存聊天记录失败')
    }
    return data
  } catch (e) {
    console.error('保存聊天记录失败:', e)
    throw new Error(e.message || '保存请求发送失败')
  }
}

// 滚动到底部的方法
function scrollToBottom() {
  if (chatMessagesContainer.value) {
    chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight
  }
}

async function handleSend() {
  error.value = ''
  if (!question.value.trim()) {
    error.value = '请输入问题'
    return
  }
  loading.value = true
  const userQuestion = question.value.trim()
  try {
    // 1. 添加用户消息到chatHistory
    chatHistory.value.push({
      role: 'user',
      content: userQuestion,
      isSpeaking: false,
    })
    // 2. 立即添加"AI正在思考中..."消息
    chatHistory.value.push({
      role: 'ai',
      content: 'AI 正在思考中...',
      isSpeaking: false,
    })
    // 3. 准备发送给AI的历史记录（从旧到新）
    const messagesForAI = chatHistory.value.map((msg) => ({
      role: msg.role === 'ai' ? 'assistant' : msg.role,
      content: msg.content,
    }))
    // 4. 获取AI回答
    const aiAnswer = await getAIAnswer(userQuestion, messagesForAI)
    // 5. 替换"AI正在思考中..."为实际回答
    chatHistory.value.pop() // 移除思考中提示
    const aiMsg = {
      role: 'ai',
      content: aiAnswer,
      isSpeaking: false,
    }
    chatHistory.value.push(aiMsg) // 添加实际回答
    // 6. 保存记录
    let retryCount = 0
    while (retryCount < 3) {
      try {
        await saveChatHistory(userQuestion, aiAnswer)
        break
      } catch (e) {
        retryCount++
        if (retryCount >= 3) throw e
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
    // 7. 语音朗读
    speak(aiAnswer, chatHistory.value.length - 1)
    question.value = ''
  } catch (e) {
    error.value = e.message
    console.error('处理错误:', e)
    if (e.message.includes('401') || e.message.includes('认证')) {
      error.value = '会话已过期，请重新登录'
    }
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>
<style scoped>
/* Reset some default styles that might interfere */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* 修复布局问题 */
.container {
  display: flex;
  width: 100%;
  min-width: 0; /* Prevent flex items from overflowing */
  height: 100vh;
  box-sizing: border-box;
}
/* 确保超链接不改变原有样式 */
.menu-link {
  display: contents; /* 关键：使<a>不产生任何布局影响 */
  text-decoration: none !important; /* 移除下划线 */
  color: inherit !important; /* 继承父元素颜色 */
}

/* 侧边栏样式 */
/* 子菜单容器 */
.submenu-container {
  margin-left: 20px; /* 缩进 */
  width: calc(100% - 20px); /* 宽度略小于父菜单 */
}

/* 子菜单项 */
.submenu-item {
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.submenu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.submenu-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 保持原有菜单项样式 */
.menu-item {
  padding: 12px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.menu-icon {
  margin-right: 10px;
}
/* 侧边栏美化 */
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
}
.submenu-fade-enter-active, .submenu-fade-leave-active {
  transition: opacity 0.3s;
}
.submenu-fade-enter-from, .submenu-fade-leave-to {
  opacity: 0;
}
.right-half {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100vh;
  box-sizing: border-box;
}
.chat-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.5); /* 半透明白色背景 */
  backdrop-filter: blur(8px); /* 毛玻璃效果（可选） */
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: center; /* 使内容居中 */
  width: 100%; /* 确保内容占满可用空间 */
}
.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}
.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.header-info {
  display: flex;
  flex-direction: column;
}
.header-info h2 {
  font-size: 18px;
  margin: 0;
  text-align: center; /* 使用户名居中 */
}
/* 移除了.user-status样式，因为不再需要显示在线状态 */
.chat-container {
  flex: 1; /* 聊天容器占满右侧容器的剩余空间 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.chat-messages {
  flex: 1; /* 聊天消息区域占满聊天容器的剩余空间 */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
  box-sizing: border-box;
  min-height: 0;
  max-height: calc(100vh - 180px); /* 头部+输入区高度预留 */
}
.input-area {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
  background: #fff;
  position: sticky;
  bottom: 0;
  z-index: 2;
}
input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
}
button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
.message {
  max-width: 60%; /* 最大宽度为60% */
  padding: 10px 15px;
  border-radius: 18px;
  position: relative;
  width: fit-content;
  width: -moz-fit-content; /* Firefox支持 */
}
.user-message {
  margin-top: 10px;
  align-self: flex-end;
  background-color: #dcf8c6;
  margin-left: auto;
}
.ai-message {
  margin-top: 10px;
  align-self: flex-start;
  background-color: #f1f0f0;
}
.message-content {
  display: flex;
  flex-direction: column;
}
.user-label,
.ai-label {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
}
.user-label {
  color: #4caf50;
}
.ai-label {
  color: #555;
}
.message-text {
  word-break: break-word;
}
.typing-indicator {
  display: inline-block;
  padding: 5px;
}
.error-message {
  color: red;
  background-color: #ffeeee;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}
/* 喇叭图标样式 */
.speaker-icon {
  cursor: pointer;
  margin-top: 5px;
  font-size: 18px;
}
/* 响应式设计 - 在小屏幕上改变布局 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  .left-half,
  .right-half {
    width: 100%;
  }
  .left-half {
    height: 50vh; /* 在小屏幕上，左侧占50%视口高度 */
  }
  .right-half {
    height: 50vh; /* 在小屏幕上，右侧占50%视口高度 */
  }
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 100;
  }
}
.sidebar-menu a,
.submenu-item {
  text-decoration: none !important;
}
</style>

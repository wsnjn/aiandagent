// src/router/index.js
// import { createRouter, createWebHistory } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/login/LoginPage.vue'
import Home from '../views/home/HomeComponent.vue'
import Register from '../views/register/RegisterPage.vue'
import ChatHistory from '@/views/history/ChatHistory.vue'
import PostArticle from '@/views/article/PostArticle.vue'
import ArticleWatch from '@/views/article/ArticleWatch.vue'
import ArticleOne from '@/views/article/ArticleOne.vue'
import VoiceChat from '@/views/chat/VoiceChat.vue'
import PdftoWord from '@/views/function/PdftoWord.vue'
import FileManager from '@/views/function/FileManager.vue'
import TTSVoice from '@/views/voice/TTSVoice.vue'
import ProfilePage from '@/views/profile/ProfilePage.vue'
const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
  },
  {
    path: '/chat-history',
    name: 'ChatHistory',
    component: ChatHistory,
  },
  {
    path: '/article',
    name: 'PostArticle',
    component: PostArticle,
  },
  {
    path: '/articles-watch',
    name: 'ArticleWatch',
    component: ArticleWatch,
  },
  {
    path: '/article/:id/:username',
    name: 'ArticleOne',
    component: ArticleOne,
    props: true, // 这样路由参数可以直接作为props传给组件
  },
  {
    path: '/chat',
    name: 'VoiceChat',
    component: VoiceChat,
    props: true, // 这样路由参数可以直接作为props传给组件
  },
  {
    path: '/ptow',
    name: 'PdftoWord',
    component: PdftoWord,
    props: true, // 这样路由参数可以直接作为props传给组件
  },
  {
    path: '/cloud',
    name: 'FileManager',
    component: FileManager,
    props: true, // 这样路由参数可以直接作为props传给组件
  },
  {
    path: '/tts',
    name: 'TTSVoice',
    component: TTSVoice,
    props: true, // 这样路由参数可以直接作为props传给组件
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router

<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="avatar-wrapper">
        <label for="avatar-upload">
          <img :src="avatarPreview || userInfo?.avatar || defaultAvatar" class="avatar" alt="头像" />
          <input id="avatar-upload" type="file" accept="image/*" @change="onAvatarChange" style="display:none" />
        </label>
      </div>
      <h2>{{ userInfo?.username || '未登录' }}</h2>
      <div class="signature">
        <span class="icon">📝</span>
        <span>{{ userInfo?.signature || '这个人很懒，什么都没写~' }}</span>
      </div>
      <div class="profile-section">
        <div class="profile-row"><span class="icon">📄</span>最近发表文章数：{{ userInfo?.articleCount ?? 0 }}</div>
      </div>
      <div class="profile-actions">
        <router-link to="/login"><el-button type="primary" size="small">登录</el-button></router-link>
        <router-link to="/register"><el-button type="success" size="small">注册</el-button></router-link>
        <el-button type="danger" size="small" @click="logout">退出登录</el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
import defaultAvatar from '@/assets/1.png'
const userStore = useUserStore()
const userInfo = ref(userStore.userInfo)
const avatarPreview = ref(null)

function onAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarPreview.value = ev.target.result
    // 这里可以调用API上传头像，上传成功后更新userInfo.avatar
    // 示例：
    // uploadAvatar(file).then(url => { userInfo.value.avatar = url })
    // 这里只做本地预览
  }
  reader.readAsDataURL(file)
}

function logout() {
  userStore.clearUserInfo()
  window.location.reload()
}
</script>
<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
}
.profile-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 40px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
  max-width: 420px;
  width: 100%;
  margin: 24px;
}
.avatar-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 18px;
}
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eee;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.avatar:hover {
  box-shadow: 0 0 0 4px #ffd70044;
}
.signature {
  color: #888;
  font-size: 1rem;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.profile-section {
  width: 100%;
  margin: 10px 0 0 0;
  padding: 12px 0 0 0;
  border-top: 1px solid #f0f0f0;
}
.profile-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  margin-bottom: 8px;
  font-size: 1rem;
}
.icon {
  font-size: 1.1em;
}
.profile-actions {
  display: flex;
  gap: 16px;
  margin-top: 22px;
  flex-wrap: wrap;
}
@media (max-width: 600px) {
  .profile-card {
    min-width: 0;
    max-width: 98vw;
    padding: 24px 6vw 18px 6vw;
  }
}
</style>

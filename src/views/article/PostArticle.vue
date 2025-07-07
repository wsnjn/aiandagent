<template>
   <div><ThreeModelViewer @speech-recognized="handleSpeechRecognized" /></div>
  <div class="page-container">
    <div class="form-container">
      <h1 class="form-title">发布文章</h1>
      <form @submit.prevent="submitArticle" class="article-form">
        <div class="form-row">
          <label for="title" class="form-label">标题</label>
          <input
            id="title"
            v-model="title"
            type="text"
            class="form-input"
            required
          />
        </div>

        <div class="form-row">
          <label for="content" class="form-label">内容</label>
          <div class="textarea-wrapper">
            <textarea
              id="content"
              v-model="content"
              class="form-textarea"
              rows="1"
              ref="contentTextarea"
              @input="adjustTextareaHeight"
              required
            ></textarea>
          </div>
        </div>

        <div class="form-row">
  <label class="form-label">分类</label>
  <div class="checkbox-group">
    <label v-for="cat in categories" :key="cat" class="checkbox-label">
      <input
        type="checkbox"
        :value="cat"
        v-model="selectedCategories"
      />
      {{ cat }}
    </label>
  </div>
</div>


        <button type="submit" class="submit-button">提交文章</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import ThreeModelViewer from '@/components/ThreeModelViewer.vue';
const userStore = useUserStore()

const categories = ['默认', '测试', '最新']  // 固定分类列表
const selectedCategories = ref([])          // 选中的分类数组

const title = ref('')
const content = ref('')
const contentTextarea = ref(null)

const submitArticle = async () => {
  const userId = userStore.userInfo?.id

  if (!userId) {
    alert('用户未登录，无法发布文章')
    return
  }
 if (selectedCategories.value.length === 0) {
    alert('请至少选择一个分类')
    return
  }
  try {
    const res = await axios.post('http://localhost:3000/api/articles', {
      title: title.value,
      content: content.value,
       category: selectedCategories.value.join(','),  // 多选分类用逗号拼接传给后端
      user_id: userId
    })
    alert('提交成功，文章 ID：' + res.data.id)
    title.value = ''
    content.value = ''
     selectedCategories.value = []
  } catch (err) {
    alert('提交失败')
    console.error(err)
  }
}

const adjustTextareaHeight = () => {
  if (contentTextarea.value) {
    contentTextarea.value.style.height = 'auto'
    contentTextarea.value.style.height = contentTextarea.value.scrollHeight + 'px'
  }
}

onMounted(() => {
  adjustTextareaHeight()
})
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.form-container {
  width: 100%;
  max-width: 600px;
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
}

.article-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.form-label {
  width: 80px;
  font-weight: 600;
  color: #555;
}

.form-input, .form-textarea {
  width: 450px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-textarea {
  resize: none;
  min-height: 300px;
  overflow-y: hidden;
}

.submit-button {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #3367d6;
}

/* Hide the resize handle in all browsers */
.form-textarea::-webkit-resizer {
  display: none;
}

.form-textarea::-moz-resizer {
  display: none;
}

.form-textarea:-ms-resizer {
  display: none;
}

.form-textarea::resizer {
  display: none;
}

.checkbox-group {
  display: flex;
  gap: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
}

</style>

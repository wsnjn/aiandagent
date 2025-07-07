<template>
  <div class="cloud-disk">
    <h1>📁 我的云盘</h1>

    <div class="upload-section">
      <input type="file" @change="handleFileChange" />
      <button class="action-btn" @click="uploadFile" :disabled="!selectedFile">上传文件</button>
    </div>

    <div v-if="fileList.length === 0" class="no-files">暂无文件</div>

    <ul class="file-list" v-else>
      <li v-for="file in fileList" :key="file.name" class="file-item">
        <a :href="'http://localhost:3000' + file.url" target="_blank" download
          >📄 {{ file.name }}</a
        >
        <button class="delete-btn action-btn" @click="deleteFile(file.name)">🗑 删除</button>
      </li>
    </ul>

    <p class="status">{{ statusMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CloudDisk',
  data() {
    return {
      selectedFile: null,
      fileList: [],
      statusMessage: '',
    }
  },
  methods: {
    handleFileChange(e) {
      this.selectedFile = e.target.files[0]
    },
    async uploadFile() {
      if (!this.selectedFile) return
      const formData = new FormData()
      formData.append('file', this.selectedFile)

      try {
        const res = await axios.post('http://localhost:3000/api/upload', formData)
        this.statusMessage = `✅ ${res.data.message}`
        this.fetchFileList()
        this.selectedFile = null
      } catch (err) {
        const msg = err?.response?.data?.error || '上传失败'
        this.statusMessage = `❌ ${msg}`
      }
    },
    async fetchFileList() {
      const res = await axios.get('http://localhost:3000/api/files')
      this.fileList = res.data.files
    },
    async deleteFile(filename) {
      try {
        await axios.delete(`http://localhost:3000/api/delete/${filename}`)
        this.statusMessage = '✅ 删除成功'
        this.fetchFileList()
      } catch (err) {
        this.statusMessage = '❌ 删除失败'
        console.log(err)
      }
    },
  },
  mounted() {
    this.fetchFileList()
  },
}
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.cloud-disk {
  min-height: 100vh;
  height: 100vh;
  overflow: auto;
  box-sizing: border-box;
  padding: 3em 5%;
  background: linear-gradient(to bottom right, #eef2f3, #f9f9f9);
  font-family: 'Segoe UI', sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 2em;
  font-size: 2rem;
}

.upload-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 2em;
}

input[type='file'] {
  font-size: 14px;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 36px;
}

.action-btn {
  height: 36px;
  line-height: 36px;
  padding: 0 16px;
  max-width: 300px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover:enabled {
  background-color: #66b1ff;
}

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 16px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.file-item a {
  color: #333;
  text-decoration: none;
  word-break: break-all;
  font-size: 14px;
  margin-right: 1em;
  flex: 1;
}

.delete-btn {
  background-color: #f56c6c;
  width: 90px;
  height: 36px;
  padding: 0;
}

.delete-btn:hover {
  background-color: #fa7d7d;
}

.no-files {
  text-align: center;
  color: #999;
  font-style: italic;
  font-size: 1rem;
}

.status {
  margin-top: 2em;
  text-align: center;
  font-weight: bold;
  color: #666;
}
</style>

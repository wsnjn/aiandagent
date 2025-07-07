<template>
  <div class="pdf-to-word-converter">
    <div
      class="drop-zone"
      @dragover.prevent="dragover"
      @dragleave.prevent="dragleave"
      @drop.prevent="drop"
      :class="{ 'is-dragover': isDragover }"
    >
      <div class="upload-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
      <p class="drop-text">拖拽 PDF 文件到此处</p>
      <p class="or-text">或</p>
      <input
        type="file"
        id="fileInput"
        ref="fileInput"
        @change="handleFileSelect"
        accept=".pdf"
        hidden
      />
      <button class="select-file-btn" @click="triggerFileInput">选择文件</button>
    </div>

    <div class="file-info" v-if="selectedFile">
      <div class="file-details">
        <div class="file-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        </div>
        <div class="file-name">{{ selectedFile.name }}</div>
        <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
      </div>
      <button class="convert-btn" @click="convertToWord" :disabled="isConverting">
        <span v-if="isConverting">转换中...</span>
        <span v-else>转换为 Word</span>
      </button>
    </div>

    <div class="status-message" v-if="statusMessage">
      <div :class="['message', statusType]">
        {{ statusMessage }}
        <a v-if="downloadUrl" :href="downloadUrl" :download="downloadFilename" class="download-link"
          >下载 Word 文件</a
        >
      </div>
    </div>

    <div class="progress-container" v-if="isConverting">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      <div class="progress-text">{{ progress }}%</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PdfToWordConverter',
  data() {
    return {
      isDragover: false,
      selectedFile: null,
      isConverting: false,
      statusMessage: '',
      statusType: '',
      downloadUrl: '',
      downloadFilename: '',
      progress: 0,
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    dragover() {
      this.isDragover = true
    },
    dragleave() {
      this.isDragover = false
    },
    drop(e) {
      this.isDragover = false
      const files = e.dataTransfer.files
      if (files.length) {
        this.handleFile(files[0])
      }
    },
    handleFileSelect(e) {
      const files = e.target.files
      if (files.length) {
        this.handleFile(files[0])
      }
    },
    handleFile(file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        this.showStatus('请选择 PDF 文件', 'error')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        this.showStatus('文件大小不能超过10MB', 'error')
        return
      }
      this.selectedFile = file
      this.statusMessage = ''
      this.downloadUrl = ''
      this.progress = 0
    },
    async convertToWord() {
      if (!this.selectedFile) return

      this.isConverting = true
      this.progress = 0
      this.statusMessage = '正在上传文件...'
      this.statusType = 'info'

      try {
        const formData = new FormData()
        formData.append('pdf', this.selectedFile)

        const response = await axios.post('http://localhost:3000/api/convert-pdf', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            this.progress = Math.round((progressEvent.loaded * 80) / progressEvent.total)
          },
        })

        if (response.data && response.data.code === 200) {
          this.downloadUrl = response.data.downloadUrl
          this.downloadFilename = this.selectedFile.name.replace('.pdf', '.docx')
          this.progress = 100
          this.showStatus('转换成功！', 'success')
        } else {
          throw new Error(response.data.message || '未知错误')
        }
      } catch (error) {
        console.error('转换失败:', error)
        let errorMsg = '转换失败'
        if (error.response && error.response.data) {
          errorMsg = error.response.data.message || errorMsg
        } else if (error.message) {
          errorMsg = error.message
        }
        this.showStatus(errorMsg, 'error')
      } finally {
        this.isConverting = false
      }
    },
    showStatus(message, type) {
      this.statusMessage = message
      this.statusType = type
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
  },
}
</script>


<style scoped>
.pdf-to-word-converter {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  box-sizing: border-box;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.drop-zone.is-dragover {
  border-color: #4a6fa5;
  background-color: #e3f2fd;
}

.upload-icon {
  margin-bottom: 15px;
  color: #4a6fa5;
}

.drop-text {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #555;
}

.or-text {
  font-size: 14px;
  color: #777;
  margin: 10px 0;
}

.select-file-btn {
  background-color: #4a6fa5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.select-file-btn:hover {
  background-color: #166088;
}

.file-info {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-details {
  display: flex;
  align-items: center;
}

.file-icon {
  margin-right: 10px;
  color: #4a6fa5;
}

.file-name {
  font-weight: 500;
  margin-right: 10px;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  color: #777;
  font-size: 14px;
}

.convert-btn {
  background-color: #4a6fa5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.convert-btn:hover:not(:disabled) {
  background-color: #166088;
}

.convert-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.status-message {
  margin-top: 20px;
}

.message {
  padding: 12px 15px;
  border-radius: 4px;
  font-size: 14px;
}

.message.info {
  background-color: #e3f2fd;
  color: #166088;
}

.message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.message.error {
  background-color: #ffebee;
  color: #c62828;
}

.download-link {
  display: inline-block;
  margin-left: 10px;
  color: #166088;
  text-decoration: none;
  font-weight: 500;
}

.download-link:hover {
  text-decoration: underline;
}

.progress-container {
  margin-top: 20px;
  height: 20px;
  background-color: #f1f1f1;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #4a6fa5;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  line-height: 20px;
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}
</style>

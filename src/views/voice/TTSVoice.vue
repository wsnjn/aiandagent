<template>
  <div class="tts-container">
    <h1>本地TTS - 百度语音合成</h1>

    <div class="input-section">
      <label for="text-input">输入要转换的文本:</label>
      <textarea
        id="text-input"
        v-model="inputText"
        placeholder="请输入需要转换为语音的文本"
        rows="4"
      ></textarea>
    </div>

    <div class="settings">
      <div class="setting-item">
        <label>语速:</label>
        <input type="range" v-model="speed" min="0" max="15" step="1">
        <span>{{ speed }}</span>
      </div>

      <div class="setting-item">
        <label>音调:</label>
        <input type="range" v-model="pitch" min="0" max="15" step="1">
        <span>{{ pitch }}</span>
      </div>

      <div class="setting-item">
        <label>音量:</label>
        <input type="range" v-model="volume" min="0" max="15" step="1">
        <span>{{ volume }}</span>
      </div>
    </div>

    <div class="voices">
      <div v-for="(voice, index) in availableVoices" :key="index">
        <input
          type="radio"
          :id="'voice-' + index"
          :value="voice.value"
          v-model="selectedVoice"
        >
        <label :for="'voice-' + index">{{ voice.name }}</label>
      </div>
    </div>

    <button
      @click="generateSpeech"
      :disabled="isLoading"
      class="generate-btn"
    >
      {{ isLoading ? '合成中...' : '生成语音' }}
    </button>

    <div v-if="audioUrl" class="audio-player">
      <audio :src="audioUrl" controls autoplay></audio>
      <a :href="audioUrl" download="tts-output.mp3" class="download-btn">下载音频</a>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      inputText: '',
      speed: 5,
      pitch: 5,
      volume: 5,
      availableVoices: [
        { name: '普通女声', value: 0 },
        { name: '普通男声', value: 1 },
        { name: '情感合成-度逍遥', value: 3 },
        { name: '情感合成-度丫丫', value: 4 }
      ],
      selectedVoice: 0,
      isLoading: false,
      audioUrl: '',
      error: '',
      accessToken: ''
    }
  },
  methods: {
    async getAccessToken() {
      try {
        // 使用本地代理
        const response = await axios.get('http://localhost:3000/api/token');
        if (response.data && response.data.access_token) {
          this.accessToken = response.data.access_token;
        } else {
          this.error = '获取访问令牌失败';
        }
      } catch (error) {
        this.error = '请求令牌时发生错误';
        console.error('错误详情:', error);
      }
    },
    async generateSpeech() {
      this.error = '';
      this.audioUrl = '';
      if (!this.inputText) {
        this.error = '请输入要合成的文本';
        return;
      }
      this.isLoading = true;
      // 确保有token
      if (!this.accessToken) {
        await this.getAccessToken();
        if (!this.accessToken) {
          this.isLoading = false;
          return;
        }
      }
      try {
        const response = await axios.post(
          'http://localhost:3000/api/tts',
          {
            text: this.inputText,
            access_token: this.accessToken,
            per: this.selectedVoice,
            spd: this.speed,
            pit: this.pitch,
            vol: this.volume
          },
          {
            responseType: 'arraybuffer'
          }
        );
        const blob = new Blob([response.data], { type: 'audio/mp3' });
        this.audioUrl = URL.createObjectURL(blob);
      } catch (error) {
        this.error = '语音合成失败';
        console.error('API错误:', error);
        // 如果令牌失效，尝试重新获取
        if (error.response?.status === 401 || error.response?.status === 400) {
          await this.getAccessToken();
        }
      } finally {
        this.isLoading = false;
      }
    },
  }
};
</script>

<style scoped>
.tts-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.input-section {
  margin-bottom: 20px;
}

.input-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.input-section textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.setting-item {
  margin: 15px 0;
  display: flex;
  align-items: center;
}

.setting-item label {
  width: 60px;
  margin-right: 10px;
}

.setting-item input[type="range"] {
  flex: 1;
  margin-right: 10px;
}

.voices {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}

.voices > div {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.generate-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.generate-btn:hover {
  background-color: #3367d6;
}

.generate-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.audio-player {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

audio {
  width: 100%;
}

.download-btn {
  display: inline-block;
  padding: 10px 15px;
  background-color: #34a853;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.error-message {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>
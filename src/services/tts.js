// 你的ElevenLabs API Key（替换成你的）
const API_KEY = 'sk_3731bf2d9357069ab4e49b9cdd7b1417e85d9d65652cdaba'

/**
 * 生成并播放中文二次元风格语音（不下载MP3）
 * @param {string} text - 要合成的文本（支持中文）
 * @param {string} voiceId - 语音ID（默认是中文二次元风格）
 */
export async function playWithElevenLabs(text, voiceId = 'fQj4gJSexpu8RDE2Ii5m') {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

  try {
    // 关键修改：显式设置语言为中文（zh）
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2', // 去除隐藏字符！
        voice_settings: {
          stability: 1,
          similarity_boost: 1,
          language: 'zh', // 强制使用中文（关键！）
        },
      }),
    })

    if (!response.ok) {
      throw new Error('语音生成失败')
    }

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audio.play()

    console.log('中文语音生成并播放成功！')
  } catch (error) {
    console.error('语音生成失败:', error)
  }
}

/**
 * 使用本地后端TTS服务生成并播放语音
 * @param {string} text - 要合成的文本
 * @param {object} options - 可选参数 { per, spd, pit, vol }
 */
export async function playWithLocalTTS(text, options = {}) {
  try {
    // 1. 获取token
    const tokenRes = await fetch('http://localhost:3000/api/token')
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) throw new Error('获取TTS令牌失败')
    // 2. 请求TTS
    const ttsRes = await fetch('http://localhost:3000/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        access_token: tokenData.access_token,
        per: options.per || 0,
        spd: options.spd || 5,
        pit: options.pit || 5,
        vol: options.vol || 5,
      }),
    })
    if (!ttsRes.ok) throw new Error('TTS语音合成失败')
    const audioBlob = await ttsRes.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audio.play()
  } catch (error) {
    console.error('本地TTS语音合成失败:', error)
  }
}

/**
 * 直接调用后端TTS接口，合成并播放音频
 * @param {string} text - 要合成的文本
 * @param {object} options - 其它TTS参数（可选）
 */
export async function playWithBackendTTS(text, options = {}) {
  try {
    const res = await fetch('http://localhost:3000/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, ...options }),
    })
    if (!res.ok) throw new Error('TTS语音合成失败')
    const audioBlob = await res.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audio.play()
  } catch (error) {
    console.error('TTS语音合成失败:', error)
  }
}

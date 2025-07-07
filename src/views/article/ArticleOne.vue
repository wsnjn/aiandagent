<template>
    <div><ThreeModelViewer @speech-recognized="handleSpeechRecognized" /></div>
  <div class="article-one-container">
    <h2>{{ article.title }}</h2>
    <p><strong>作者：</strong>{{ article.username }}</p>
    <p>{{ article.content }}</p>
    <small>发布时间：{{ article.created_at }}</small>
  </div>
</template>

<script>
import axios from 'axios';
import ThreeModelViewer from '@/components/ThreeModelViewer.vue';
export default {
  components: {
    ThreeModelViewer,
  },
  props: ['id', 'username'],  // 接收路由传来的参数

  data() {
    return {
      article: null,
      loading: false,
      error: null,
    };
  },

  created() {
    this.fetchArticle();
  },

  methods: {
    async fetchArticle() {
      this.loading = true;
      try {
        // 假设你的接口可以用id和username查询文章，调整为你的实际接口
        const res = await axios.get('http://localhost:3000/api/article-detail', {
          params: { id: this.id, username: this.username }
        });

        if (res.data.code === 200 && res.data.data) {
          this.article = res.data.data;
        } else {
          this.error = '文章未找到';
        }
      } catch (e) {
        this.error = '加载文章失败';
        console.error(e);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.article-one-container {
  max-width: 700px;
  margin: 30px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>

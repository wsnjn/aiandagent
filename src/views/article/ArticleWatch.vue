<template>
  <div class="container">
    <div>
      <ThreeModelViewer @speech-recognized="handleSpeechRecognized" />
    </div>
    <div class="article-section">
      <!-- 标题单独一行 -->
      <h2 class="forum-title">论坛</h2>

      <!-- 筛选框单独一行，左右分布 -->
      <div class="filters-row">
        <label class="filter-left">
          筛选成员：
          <select v-model="selectedUserId" @change="fetchArticles">
            <option value="">全部成员</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.username }}
            </option>
          </select>
        </label>

        <label class="filter-right">
          筛选分类：
          <select v-model="selectedCategory" @change="fetchArticles">
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </label>
      </div>

      <ul class="article-list">
        <li v-for="article in articles" :key="article.id" class="article-item">
          <h3>
            <router-link
              :to="{ name: 'ArticleOne', params: { id: article.id, username: article.username } }"
              class="article-title-link"
            >
              {{ article.title }}
            </router-link>
          </h3>
          <p>作者：{{ article.username }}</p>
          <p class="article-content">{{ article.content }}</p>
          <small>发布时间：{{ article.created_at }}</small>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ThreeModelViewer from '@/components/ThreeModelViewer.vue';
import { useUserStore } from '@/stores/user';

export default {
  components: {
    ThreeModelViewer,
  },
  data() {
    return {
      users: [],
      articles: [],
      categories: [],
      selectedUserId: '',
      selectedCategory: '',
      userStore: useUserStore(),
    };
  },
  created() {
    this.fetchUsers();
    this.fetchCategories();
    this.fetchArticles();
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await axios.get('http://localhost:3000/api/user');
        this.users = res.data;
        console.log('成功获取用户:', this.users);
      } catch (error) {
        console.error('获取用户失败', error);
      }
    },
    async fetchCategories() {
      try {
        this.categories = ['默认', '测试','最新'];
      } catch (error) {
        console.error('获取分类失败', error);
      }
    },
    async fetchArticles() {
      try {
        let url = 'http://localhost:3000/api/articles-watch?';

        if (this.selectedUserId) {
          url += `userId=${this.selectedUserId}&`;
        }
        if (this.selectedCategory) {
          url += `category=${encodeURIComponent(this.selectedCategory)}&`;
        }

        const res = await axios.get(url);
        if (res.data.code === 200) {
          this.articles = res.data.data;
          console.log('成功获取文章:', this.articles);
          // 统计当前登录用户的文章数
          const userId = this.userStore.userInfo?.id;
          const username = this.userStore.userInfo?.username;
          const count = this.articles.filter(a =>
            (userId && (a.user_id == userId || a.userId == userId)) ||
            (username && a.username === username)
          ).length;
          this.userStore.setUserInfo({
            ...this.userStore.userInfo,
            articleCount: count
          });
        } else {
          this.articles = [];
          console.log('文章获取失败，返回数据:', res.data);
        }
      } catch (error) {
        console.error('获取文章失败', error);
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  text-align: center;
  min-height: 100vh;
  height: 100vh;
  overflow: auto;
  box-sizing: border-box;
}

.article-content {
  color: #444;
  margin: 12px 0 8px 0;
  font-size: 1.08rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}


.article-section {
  margin-top: 40px;
  text-align: left;
}

/* 标题单独居中 */
.forum-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 32px;
  letter-spacing: 2px;
  color: #2c3e50;
}

/* 筛选框一行，左右分布 */
.filters-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 28px;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 32px 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 32px;
}

.article-item {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: 0 4px 16px rgba(44,62,80,0.08);
  background-color: #fff;
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.article-item:hover {
  box-shadow: 0 8px 32px rgba(44,62,80,0.16);
  transform: translateY(-4px) scale(1.02);
}

.article-item h3 {
  margin-top: 0;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.article-title-link {
  color: #1976d2;
  text-decoration: none;
  transition: color 0.2s;
}

.article-title-link:visited {
  color: #5b9bd5;
}

.article-title-link:hover {
  color: #125ea2;
  text-decoration: underline;
}

.article-item p {
  margin: 0 0 6px 0;
}

.article-item small {
  color: #888;
  font-size: 0.95em;
}

select {
  margin-left: 10px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1em;
}

@media (max-width: 900px) {
  .container {
    padding: 16px 2vw;
    max-width: 100vw;
  }
  .article-list {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}
</style>

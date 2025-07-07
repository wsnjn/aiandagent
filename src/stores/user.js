import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    userInfo: null,
  }),
  actions: {
    setUserToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    clearUserInfo() {
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
    initFromLocalStorage() {
      const token = localStorage.getItem('token');
      const userInfoStr = localStorage.getItem('userInfo');

      if (token) this.token = token;
      if (userInfoStr) {
        try {
          this.userInfo = JSON.parse(userInfoStr);
        } catch (error) {
          console.error('解析用户信息失败:', error);
        }
      }
    }
  }
});

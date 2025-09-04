<!-- src/views/LoginView.vue -->
<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>用户登录</h1>
          <p>欢迎回来，请登录您的账户</p>

        </div>
        <form @submit.prevent="login" class="login-form">
          <div class="form-group">
            <div class="register-link">
              还没有账户？<router-link to="/register">立即注册</router-link>
            </div>
            <label for="username">用户名/手机号</label>
            <div class="input-wrapper">
              <i class="icon-user"></i>
              <input
                  type="text"
                  id="username"
                  v-model="username"
                  placeholder="请输入用户名或手机号"
                  autocomplete="username"
                  required
              >
            </div>
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <div class="input-wrapper">
              <i class="icon-lock"></i>
              <input
                  type="password"
                  id="password"
                  v-model="password"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  required
              >
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe">
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>

          <button
              type="submit"
              class="login-btn"
              :disabled="loading"
          >
            {{ loading ? '登录中...' : '立即登录' }}
          </button>

          <div class="divider">
            <span>或</span>
          </div>

          <div class="social-login">
            <button type="button" class="social-btn wechat-btn">
              <i class="icon-wechat"></i>
              微信登录
            </button>
            <button type="button" class="social-btn qq-btn">
              <i class="icon-qq"></i>
              QQ登录
            </button>
          </div>
        </form>


      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/utils/request";
import md5 from "crypto-js/md5";

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      rememberMe: false,
      loading: false
    }
  },

  methods: {
    async login() {
      if (!this.username || !this.password) {
        alert('请输入用户名和密码');
        return;
      }

      this.loading = true;

      try {
        const encryptedPassword = md5(this.password).toString();
        const result = await apiRequest.post("/api/user/login", {
          username: this.username,
          password: encryptedPassword
        });

        if (result.code === 0) {
          // 保存 token，randStr
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('randStr', result.data.randStr);

          // 如果选择了记住我，保存用户名
          if (this.rememberMe) {
            localStorage.setItem('rememberedUsername', this.username);
          } else {
            localStorage.removeItem('rememberedUsername');
          }

          // 检查是否有重定向路径
          const redirectPath = localStorage.getItem('redirectAfterLogin');
          if (redirectPath) {
            // 清除重定向路径
            localStorage.removeItem('redirectAfterLogin');
            // 重定向到原页面
            this.$router.push(redirectPath);
          } else {
            // 默认跳转到首页
            this.$router.push('/');
          }
        } else {
          alert('登录失败：' + result.msg);
        }
      } catch (error) {
        console.error('登录失败:', error);
        alert('登录失败，请检查网络连接或稍后重试');
      } finally {
        this.loading = false;
      }
    }
  },

  mounted() {
    // 如果之前选择了记住我，自动填充用户名
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      this.username = rememberedUsername;
      this.rememberMe = true;
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
}

.login-header h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
}

.login-header p {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.remember-me input {
  margin-right: 8px;
}

.remember-me span {
  color: #333;
}

.forgot-password {
  color: #007bff;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  margin: 25px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #eee;
}

.divider span {
  padding: 0 15px;
  color: #999;
  font-size: 14px;
}

.social-login {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.social-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.social-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.wechat-btn:hover {
  border-color: #07c160;
  color: #07c160;
}

.qq-btn:hover {
  border-color: #12b7f5;
  color: #12b7f5;
}

.register-link {
  color: #666;
  font-size: 14px;
  float:right;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 图标样式 */
.icon-user::before,
.icon-lock::before,
.icon-wechat::before,
.icon-qq::before {
  content: "";
  display: inline-block;
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.icon-user::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E");
}

.icon-lock::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E");
}

.icon-wechat::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2307c160'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 15h-4v-2h4v2zm-6 0H6v-2h4v2zm6-4H8v-2h8v2z'/%3E%3C/svg%3E");
}

.icon-qq::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2312b7f5'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 15h-2v-2h2v2zm-8 0H7v-2h2v2zm4-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z'/%3E%3C/svg%3E");
}

@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
  }

  .social-login {
    flex-direction: column;
  }

  .form-options {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>

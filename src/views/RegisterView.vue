<!-- src/views/RegisterView.vue -->
<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>用户注册</h1>
          <p>欢迎加入我们，请填写以下信息</p>
        </div>

        <form @submit.prevent="register" class="register-form">
          <div class="form-group">
            <div class="login-link">
              已有账户？<router-link to="/login">立即登录</router-link>
            </div>
            <label for="username">用户名</label>
            <div class="input-wrapper">
              <i class="icon-user"></i>
              <input
                  type="text"
                  id="username"
                  v-model="formData.username"
                  placeholder="请输入用户名（4-20个字符）"
                  :class="{ 'error': errors.username }"
                  @blur="validateUsername"
              >
            </div>
            <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
          </div>

          <div class="form-group">
            <label for="phone">手机号</label>
            <div class="input-wrapper">
              <i class="icon-phone"></i>
              <input
                  type="tel"
                  id="phone"
                  v-model="formData.phone"
                  placeholder="请输入手机号"
                  :class="{ 'error': errors.phone }"
                  @blur="validatePhone"
              >
            </div>
            <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="verificationCode">图形验证码</label>
              <div class="input-wrapper verification-wrapper">
                <i class="icon-code"></i>
                <input
                    type="text"
                    id="verificationCode"
                    v-model="formData.verificationCode"
                    placeholder="请输入图形验证码"
                    :class="{ 'error': errors.verificationCode }"
                    @blur="validateVerificationCode"
                >
                <img
                    :src="captchaImage"
                    alt="验证码"
                    class="captcha-image"
                    @click="loadCaptcha"
                >
              </div>
              <div v-if="errors.verificationCode" class="error-message">{{ errors.verificationCode }}</div>
              <div class="captcha-tip">点击图片刷新验证码</div>
            </div>
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <div class="input-wrapper">
              <i class="icon-lock"></i>
              <input
                  type="password"
                  id="password"
                  v-model="formData.password"
                  placeholder="请输入密码（至少6位）"
                  :class="{ 'error': errors.password }"
                  @blur="validatePassword"
              >
            </div>
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <div class="input-wrapper">
              <i class="icon-lock"></i>
              <input
                  type="password"
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  placeholder="请再次输入密码"
                  :class="{ 'error': errors.confirmPassword }"
                  @blur="validateConfirmPassword"
              >
            </div>
            <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
          </div>

          <div class="form-options">
            <label class="agree-terms">
              <input
                  type="checkbox"
                  v-model="agreeTerms"
                  :class="{ 'error': errors.agreeTerms }"
              >
              <span>我已阅读并同意 <a href="#" @click.prevent="showTerms">用户协议</a> 和 <a href="#" @click.prevent="showPrivacy">隐私政策</a></span>
            </label>
            <div v-if="errors.agreeTerms" class="error-message">{{ errors.agreeTerms }}</div>
          </div>

          <button
              type="submit"
              class="register-btn"
              :disabled="loading"
          >
            {{ loading ? '注册中...' : '立即注册' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 用户协议弹窗 -->
    <div v-if="showTermsModal" class="modal-overlay" @click="showTermsModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>用户协议</h3>
          <button class="close-btn" @click="showTermsModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>这里是用户协议内容...</p>
          <p>1. 用户权利与义务</p>
          <p>2. 平台服务条款</p>
          <p>3. 免责声明</p>
          <p>4. 其他条款</p>
        </div>
      </div>
    </div>

    <!-- 隐私政策弹窗 -->
    <div v-if="showPrivacyModal" class="modal-overlay" @click="showPrivacyModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>隐私政策</h3>
          <button class="close-btn" @click="showPrivacyModal = false">×</button>
        </div>
        <div class="modal-body">
          <p>这里是隐私政策内容...</p>
          <p>1. 信息收集与使用</p>
          <p>2. 信息保护措施</p>
          <p>3. 第三方共享</p>
          <p>4. 用户权利</p>
        </div>
      </div>
    </div>

    <!-- 注册成功弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-content success-modal">
        <div class="success-icon">✓</div>
        <h3>注册成功</h3>
        <p>恭喜您注册成功！</p>
        <button class="confirm-btn" @click="goToLogin">立即登录</button>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/utils/request";
import md5 from "crypto-js/md5";

export default {
  name: 'RegisterView',
  data() {
    return {
      formData: {
        username: '',
        phone: '',
        verificationCode: '',
        password: '',
        confirmPassword: ''
      },
      errors: {},
      agreeTerms: false,
      loading: false,
      captchaImage: '', // 图形验证码图片
      showTermsModal: false,
      showPrivacyModal: false,
      showSuccessModal: false
    }
  },

  computed: {
    // 移除了倒计时相关计算属性
  },

  methods: {
    // 加载图形验证码
    async loadCaptcha() {
      try {
        const result = await apiRequest.get("/api/user/captcha");
        if (result.code === 0) {
          this.captchaImage = result.data.imageBase64;
        }
      } catch (error) {
        console.error('加载验证码失败:', error);
      }
    },

    // 验证用户名
    validateUsername() {
      const username = this.formData.username.trim();
      if (!username) {
        this.errors.username = '请输入用户名';
        return false;
      }
      if (username.length < 4 || username.length > 20) {
        this.errors.username = '用户名长度应为4-20个字符';
        return false;
      }
      delete this.errors.username;
      return true;
    },

    // 验证手机号
    validatePhone() {
      const phone = this.formData.phone.trim();
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phone) {
        this.errors.phone = '请输入手机号';
        return false;
      }
      if (!phoneRegex.test(phone)) {
        this.errors.phone = '请输入正确的手机号';
        return false;
      }
      delete this.errors.phone;
      return true;
    },

    // 验证验证码
    validateVerificationCode() {
      const code = this.formData.verificationCode.trim();
      if (!code) {
        this.errors.verificationCode = '请输入验证码';
        return false;
      }
      if (code.length !== 4) {
        this.errors.verificationCode = '验证码应为4位字符';
        return false;
      }
      delete this.errors.verificationCode;
      return true;
    },

    // 验证密码
    validatePassword() {
      const password = this.formData.password;
      if (!password) {
        this.errors.password = '请输入密码';
        return false;
      }
      if (password.length < 6) {
        this.errors.password = '密码至少6位';
        return false;
      }
      delete this.errors.password;
      return true;
    },

    // 验证确认密码
    validateConfirmPassword() {
      const password = this.formData.password;
      const confirmPassword = this.formData.confirmPassword;
      if (!confirmPassword) {
        this.errors.confirmPassword = '请再次输入密码';
        return false;
      }
      if (password !== confirmPassword) {
        this.errors.confirmPassword = '两次输入的密码不一致';
        return false;
      }
      delete this.errors.confirmPassword;
      return true;
    },

    // 验证是否同意条款
    validateAgreeTerms() {
      if (!this.agreeTerms) {
        this.errors.agreeTerms = '请阅读并同意用户协议和隐私政策';
        return false;
      }
      delete this.errors.agreeTerms;
      return true;
    },

    // 注册
    async register() {
      // 清除之前的所有错误
      this.errors = {};

      // 验证所有字段
      const isValid = this.validateUsername() &&
          this.validatePhone() &&
          this.validateVerificationCode() &&
          this.validatePassword() &&
          this.validateConfirmPassword() &&
          this.validateAgreeTerms();

      if (!isValid) {
        return;
      }

      this.loading = true;
      try {
        // 对密码进行MD5加密
        const encryptedPassword = md5(this.formData.password).toString();

        const result = await apiRequest.post("/api/user/register", {
          username: this.formData.username,
          phone: this.formData.phone,
          verificationCode: this.formData.verificationCode,
          password: encryptedPassword // 发送加密后的密码
        });

        if (result.code === 0) {
          // 注册成功
          this.showSuccessModal = true;
        } else {
          // 注册失败时刷新验证码
          this.loadCaptcha();
          alert('注册失败：' + result.msg);
        }
      } catch (error) {
        console.error('注册失败:', error);
        // 注册失败时刷新验证码
        this.loadCaptcha();
        alert('注册失败，请稍后重试');
      } finally {
        this.loading = false;
      }
    },

    // 显示用户协议
    showTerms() {
      this.showTermsModal = true;
    },

    // 显示隐私政策
    showPrivacy() {
      this.showPrivacyModal = true;
    },

    // 跳转到登录页面
    goToLogin() {
      this.showSuccessModal = false;
      this.$router.push('/login');
    }
  },

  mounted() {
    // 页面加载时获取验证码
    this.loadCaptcha();
  }
}
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 500px;
}

.register-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
}

.register-header h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 28px;
}

.register-header p {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
}

.register-form {
  text-align: left;
}

.form-row {
  display: flex;
  gap: 15px;
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

.input-wrapper input.error {
  border-color: #dc3545;
}

.verification-wrapper {
  display: flex;
  align-items: center;
}

.verification-wrapper input {
  flex: 1;
  margin-right: 10px;
}

.captcha-image {
  height: 40px;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.captcha-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  text-align: right;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 5px;
}

.form-options {
  margin-bottom: 25px;
}

.agree-terms {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 14px;
}

.agree-terms input {
  margin-top: 3px;
  margin-right: 8px;
}

.agree-terms a {
  color: #007bff;
  text-decoration: none;
}

.agree-terms a:hover {
  text-decoration: underline;
}

.register-btn {
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

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  color: #666;
  font-size: 14px;
  float:right;
  margin-top: 2px;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

/* 图标样式 */
.icon-user::before,
.icon-phone::before,
.icon-code::before,
.icon-lock::before {
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

.icon-phone::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/%3E%3C/svg%3E");
}

.icon-code::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3E%3C/svg%3E");
}

.icon-lock::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'/%3E%3C/svg%3E");
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  color: #666;
  line-height: 1.6;
}

.success-modal {
  text-align: center;
  padding: 30px;
}

.success-icon {
  font-size: 48px;
  color: #28a745;
  margin-bottom: 20px;
}

.success-modal h3 {
  margin-bottom: 10px;
  color: #333;
}

.success-modal p {
  margin-bottom: 20px;
  color: #666;
}

.confirm-btn {
  padding: 12px 30px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.confirm-btn:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .register-card {
    padding: 30px 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .verification-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .verification-wrapper input {
    margin-right: 0;
    margin-bottom: 10px;
  }

  .captcha-image {
    align-self: flex-start;
  }
}
</style>

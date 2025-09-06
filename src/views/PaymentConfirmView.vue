<!-- src/views/PaymentConfirmView.vue -->
<template>
  <div class="payment-confirm-page">
    <div class="payment-confirm-container">
      <h1>支付确认</h1>

      <div v-if="!isLoggedIn" class="login-prompt">
        <p>请先登录以继续支付</p>
        <button @click="goToLogin" class="login-btn">立即登录</button>
      </div>

      <div v-else-if="orderInfo" class="payment-content">
        <div class="order-info-section">
          <h2>订单信息</h2>
          <div class="order-details">
            <p><strong>订单号：</strong>{{ orderInfo.orderNo }}</p>
            <!-- 注意：接口返回数据中没有创建时间字段，这里暂时不显示 -->
            <p><strong>支付方式：</strong>
              <select v-model="selectedPayType" class="pay-type-select">
                <option
                    v-for="payType in orderInfo.payTypeInfos"
                    :key="payType.payType"
                    :value="payType.payType">
                  {{ payType.payTypeName }}
                </option>
              </select>
            </p>
            <p><strong>应付金额：</strong><span class="amount">¥{{ calculateParam.payFee.toFixed(2) }}</span></p>
          </div>
        </div>

        <div class="address-section">
          <h2>收货信息</h2>
          <div class="address-details">
            <p><strong>收货人：</strong>{{ calculateParam.addressDto.name }}</p>
            <p><strong>联系电话：</strong>{{ calculateParam.addressDto.mobile }}</p>
            <p><strong>收货地址：</strong>{{ formatFullAddress(calculateParam.addressDto) }}</p>
          </div>
        </div>

        <div class="items-section">
          <h2>商品信息</h2>
          <div class="order-items">
            <div
                v-for="item in calculateParam.orderItems"
                :key="item.skuId"
                class="order-item"
            >
              <div class="item-info">
                <span class="item-name">{{ item.title }}</span>
                <span class="item-specs">{{ getSpecsText(item.specInfo) }}</span>
                <span class="item-quantity">数量：x{{ item.buyNum }}</span>
              </div>
              <div class="item-price">
                ¥{{ item.payFee.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <div class="payment-section">
          <h2>支付金额</h2>
          <div class="payment-summary">
            <div class="summary-row">
              <span>商品总价：</span>
              <span>¥{{ calculateParam.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>运费：</span>
              <span>¥{{ calculateParam.shippingPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>优惠券：</span>
              <span>-¥{{ calculateParam.couponPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-row final-total">
              <span>应付总额：</span>
              <span class="amount">¥{{ calculateParam.payFee.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="payment-actions">
          <button @click="goBack" class="back-btn">取消订单</button>
          <button @click="confirmPayment" :disabled="isPaying" class="pay-btn">
            {{ isPaying ? '支付中...' : '确认支付' }}
          </button>
        </div>
      </div>

      <div v-else class="loading-section">
        <div class="loading-spinner"></div>
        <p>正在加载订单信息...</p>
      </div>
    </div>

    <!-- 支付成功弹窗 -->
    <div v-if="showSuccessDialog" class="dialog-overlay">
      <div class="dialog success-dialog">
        <div class="success-icon">✓</div>
        <h3>支付成功</h3>
        <p>您的订单已支付成功！</p>
        <div class="dialog-actions">
          <button @click="viewOrder" class="primary-btn">
            查看订单
          </button>
          <button @click="continueShopping" class="secondary-btn">
            继续购物
          </button>
        </div>
      </div>
    </div>

    <!-- 加载提示 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/utils/request";

export default {
  name: 'PaymentConfirmView',
  data() {
    return {
      isLoggedIn: false,
      orderInfo: null,
      selectedPayType: '', // 选中的支付方式
      isLoading: false,
      isPaying: false,
      showSuccessDialog: false
    }
  },

  computed: {
    orderId() {
      return this.$route.params.orderId;
    },

    // 为了方便访问 calculateParam 数据
    calculateParam() {
      return this.orderInfo?.calculateParam || {};
    }
  },

  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;
    },

    goToLogin() {
      localStorage.setItem('redirectAfterLogin', this.$route.fullPath);
      this.$router.push('/login');
    },

    formatFullAddress(addressDto) {
      // 注意：这里需要根据实际的省市区数据来显示完整地址
      // 目前只是简单拼接，实际项目中可能需要通过地区码获取具体名称
      return `${addressDto.province}${addressDto.city}${addressDto.district}${addressDto.detail}`;
    },

    getSpecsText(specifications) {
      if (!specifications || specifications.length === 0) return '';
      return specifications.map(spec => `${spec.specName}: ${spec.value}`).join(', ');
    },

    async loadOrderInfo() {
      if (!this.orderId) {
        this.$router.push('/checkout');
        return;
      }

      this.isLoading = true;
      try {
        const result = await apiRequest.get("/api/order/pay_detail",{ orderNo: this.orderId });

        if (result.code === 0) {
          this.orderInfo = result.data;
          // 默认选中第一个支付方式
          if (this.orderInfo.payTypeInfos && this.orderInfo.payTypeInfos.length > 0) {
            this.selectedPayType = this.orderInfo.payTypeInfos[0].payType;
          }
        } else {
          this.$message?.error('加载订单信息失败：' + result.msg);
          this.$router.push('/checkout');
        }
      } catch (error) {
        console.error('加载订单信息失败:', error);
        this.$message?.error('加载订单信息失败，请重试');
        this.$router.push('/checkout');
      } finally {
        this.isLoading = false;
      }
    },

    goBack() {
      this.$router.push('/checkout');
    },

    async confirmPayment() {
      if (!this.orderInfo) return;

      this.isPaying = true;
      try {
        // 调用支付接口
        const result = await apiRequest.post("/api/order/create_pay", {
          orderNo: this.orderInfo.orderNo,
          payType: this.selectedPayType
        });

        if (result.code === 0) {
          this.showSuccessDialog = true;
        } else {
          this.$message?.error('支付失败：' + result.msg);
        }
      } catch (error) {
        console.error('支付失败:', error);
        this.$message?.error('支付失败，请重试');
      } finally {
        this.isPaying = false;
      }
    },

    viewOrder() {
      this.showSuccessDialog = false;
      this.$router.push(`/orders/${this.orderInfo.orderNo}`);
    },

    continueShopping() {
      this.showSuccessDialog = false;
      this.$router.push('/products');
    }
  },

  mounted() {
    this.checkLoginStatus();
    if (this.isLoggedIn) {
      this.loadOrderInfo();
    }
  },

  watch: {
    '$route'() {
      this.checkLoginStatus();
      if (this.isLoggedIn) {
        this.loadOrderInfo();
      }
    }
  }
}
</script>

<style scoped>
.payment-confirm-page {
  padding: 20px;
  min-height: calc(100vh - 120px);
  position: relative;
}

.payment-confirm-container {
  max-width: 800px;
  width: 60%;
  margin: 0 auto;
}

.payment-confirm-container h1 {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.login-prompt {
  text-align: center;
  padding: 60px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.login-prompt p {
  font-size: 20px;
  margin-bottom: 20px;
  color: #666;
}

.login-btn {
  padding: 12px 30px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #0056b3;
}

.payment-content {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
}

.payment-content h2 {
  margin-bottom: 15px;
  font-size: 20px;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.order-details, .address-details {
  margin-bottom: 20px;
}

.order-details p, .address-details p {
  margin: 10px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.order-details strong {
  min-width: 80px;
  display: inline-block;
}

.pay-type-select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.amount {
  color: #ff6700;
  font-weight: bold;
  font-size: 18px;
}

.order-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.item-name {
  font-weight: bold;
}

.item-specs {
  font-size: 14px;
  color: #666;
}

.item-quantity {
  color: #666;
}

.item-price {
  font-weight: bold;
  color: #ff6700;
}

.payment-summary {
  border-top: 2px solid #ddd;
  padding-top: 15px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.final-total {
  font-size: 18px;
  font-weight: bold;
  color: #ff6700;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
}

.payment-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.back-btn, .pay-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-btn {
  background-color: #6c757d;
  color: white;
}

.back-btn:hover:not(:disabled) {
  background-color: #5a6268;
}

.pay-btn {
  background-color: #ff6700;
  color: white;
}

.pay-btn:hover:not(:disabled) {
  background-color: #e55d00;
}

.pay-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-section {
  text-align: center;
  padding: 60px 20px;
}

.loading-section p {
  margin-top: 20px;
  color: #666;
}

.dialog-overlay {
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

.dialog {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  position: relative;
}

.success-dialog {
  max-width: 400px;
}

.success-icon {
  width: 60px;
  height: 60px;
  background-color: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 30px;
  font-weight: bold;
}

.dialog h3 {
  margin-bottom: 15px;
  color: #333;
}

.dialog p {
  margin-bottom: 10px;
  color: #666;
}

.dialog-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

.primary-btn, .secondary-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
}

.secondary-btn:hover:not(:disabled) {
  background-color: #5a6268;
}

.primary-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 加载动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .payment-confirm-container {
    width: 90%;
  }

  .payment-actions {
    flex-direction: column;
    gap: 10px;
  }

  .back-btn, .pay-btn {
    width: 100%;
  }

  .dialog {
    padding: 20px;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .order-details p, .address-details p {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .order-details strong {
    min-width: auto;
  }
}
</style>

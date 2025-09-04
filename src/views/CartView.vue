<!-- src/views/CartView.vue -->
<template>
  <div class="cart-page">
    <div class="cart-container">
      <h1>购物车</h1>

      <div v-if="cartItems.length === 0" class="empty-cart">
        <p>购物车为空</p>
        <router-link to="/products" class="continue-shopping">
          继续购物
        </router-link>
      </div>

      <div v-else>
        <div class="cart-items">
          <div
              v-for="item in cartItems"
              :key="item.skuId"
              class="cart-item"
          >
            <div class="item-image">
              <img :src="item.image" :alt="item.title">
            </div>

            <div class="item-details">
              <h3>{{ item.title }}</h3>
              <p class="item-specs">{{ getSpecsText(item.specifications) }}</p>
              <p class="item-price">¥{{ item.price }}</p>
            </div>

            <div class="item-quantity">
              <button @click="updateQuantity(item.skuId, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="updateQuantity(item.skuId, item.quantity + 1)" :disabled="item.quantity >= item.stock">+</button>
            </div>

            <div class="item-total">
              ¥{{ (item.price * item.quantity).toFixed(2) }}
            </div>

            <button
                @click="removeItem(item.skuId)"
                class="remove-item"
            >
              删除
            </button>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-item">
            <span>商品总数:</span>
            <span>{{ totalItems }}</span>
          </div>
          <div class="summary-item">
            <span>总价:</span>
            <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <button
              @click="checkout"
              class="checkout-btn"
              :disabled="totalItems === 0"
          >
            去结算
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartView',
  data() {
    return {
      cart: []
    }
  },

  computed: {
    cartItems() {
      return this.cart
    },

    totalItems() {
      return this.cart.reduce((total, item) => total + item.quantity, 0)
    },

    totalPrice() {
      return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    }
  },

  methods: {
    // 获取规格文本
    getSpecsText(specifications) {
      if (!specifications || specifications.length === 0) return '默认规格'
      return specifications.map(spec => `${spec.specName}: ${spec.value}`).join(', ')
    },

    // 更新商品数量
    updateQuantity(skuId, newQuantity) {
      if (newQuantity <= 0) {
        this.removeItem(skuId)
        return
      }

      const item = this.cart.find(item => item.skuId === skuId)
      if (item) {
        // 检查库存
        if (newQuantity > item.stock) {
          newQuantity = item.stock
        }
        item.quantity = newQuantity
        this.saveCart()
      }
    },

    // 删除商品
    removeItem(skuId) {
      this.cart = this.cart.filter(item => item.skuId !== skuId)
      this.saveCart()
    },

    // 保存购物车到 localStorage
    saveCart() {
      localStorage.setItem('shoppingCart', JSON.stringify(this.cart))
      // 触发购物车更新事件
      this.dispatchCartUpdateEvent()
    },

    // 从 localStorage 加载购物车
    loadCart() {
      try {
        const cartData = localStorage.getItem('shoppingCart')
        if (cartData) {
          this.cart = JSON.parse(cartData)
        }
      } catch (error) {
        console.error('加载购物车数据失败:', error)
        this.cart = []
      }
    },

    // 触发购物车更新事件
    dispatchCartUpdateEvent() {
      // 创建并派发自定义事件，通知其他组件购物车已更新
      const event = new CustomEvent('cart-updated')
      document.dispatchEvent(event)
    },

    // 去结算
    checkout() {
      // 将购物车数据存储到 sessionStorage 以便在结算页面使用
      sessionStorage.setItem('checkoutItems', JSON.stringify(this.cart));

      // 跳转到结算页面
      this.$router.push('/checkout');
    }
  },

  mounted() {
    this.loadCart()
  }
}
</script>

<style scoped>
.cart-page {
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
}

.cart-container h1 {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
}

.empty-cart p {
  font-size: 20px;
  margin-bottom: 20px;
  color: #666;
}

.continue-shopping {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.continue-shopping:hover {
  background-color: #0056b3;
}

.cart-items {
  margin-bottom: 30px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 15px;
  gap: 20px;
}

.item-image {
  flex: 0 0 100px;
}

.item-image img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.item-details {
  flex: 2;
}

.item-details h3 {
  margin-bottom: 8px;
  font-size: 18px;
}

.item-specs {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.item-price {
  color: #ff6700;
  font-weight: bold;
  font-size: 16px;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-quantity button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.item-quantity button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-quantity button:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
}

.item-quantity span {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
}

.item-total {
  flex: 1;
  text-align: right;
  font-weight: bold;
  color: #ff6700;
  font-size: 18px;
}

.remove-item {
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-item:hover {
  background-color: #c82333;
}

.cart-summary {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 18px;
}

.total-price {
  font-weight: bold;
  color: #ff6700;
  font-size: 24px;
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  background-color: #ff6700;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.checkout-btn:hover:not(:disabled) {
  background-color: #e55d00;
}

.checkout-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    text-align: center;
  }

  .item-details, .item-quantity, .item-total {
    width: 100%;
  }

  .item-total {
    text-align: center;
  }

  .summary-item {
    flex-direction: column;
    gap: 10px;
  }
}
</style>

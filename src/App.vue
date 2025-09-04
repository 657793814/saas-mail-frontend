<!-- src/App.vue -->
<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-logo">商城</router-link>
        <ul class="nav-menu">
          <li class="nav-item">
            <router-link to="/" class="nav-link">首页</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/products" class="nav-link">商品</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/cart" class="nav-link">
              购物车 ({{ cartItemCount }})
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      cartItemCount: 0
    }
  },
  computed: {
    // 注意：这里移除了重复的 cartItemCount computed 属性
  },
  methods: {
    // 计算购物车商品总数
    calculateCartItemCount() {
      try {
        const cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]')
        return cart.reduce((total, item) => total + item.quantity, 0)
      } catch (error) {
        console.error('计算购物车数量失败:', error)
        return 0
      }
    },

    // 更新购物车数量
    updateCartCount() {
      this.cartItemCount = this.calculateCartItemCount()
    }
  },
  mounted() {
    // 初始化购物车数量
    this.updateCartCount()

    // 监听购物车更新事件
    document.addEventListener('cart-updated', this.updateCartCount)

    // 监听路由变化时也更新数量
    this.$router.afterEach(this.updateCartCount)
  },
  beforeUnmount() {
    // 清理事件监听器
    document.removeEventListener('cart-updated', this.updateCartCount)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
}

.navbar {
  background-color: #333;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.nav-logo {
  color: #fff;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  list-style: none;
}

.nav-item {
  margin-left: 2rem;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #ff6700;
}

main {
  min-height: calc(100vh - 80px);
}
</style>

<template>
  <div class="home">
    <header class="hero-section">
      <h1>欢迎来到商城</h1>
      <p>发现最新最热的商品</p>
    </header>

    <section class="featured-products">
      <h2>推荐商品</h2>
      <div class="products-grid">
        <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
            @view-detail="viewProductDetail"
        />
      </div>
    </section>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import apiRequest from "@/utils/request";

export default {
  name: 'HomeView',
  components: {
    ProductCard
  },
  data() {
    return {
      featuredProducts: []
    }
  },
  async mounted() {
    await this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      try {
        console.log('开始请求商品列表...')
        // 直接使用 fetch 发送请求，确保路径正确
        const result = await apiRequest.post('/api/product_list',{current:1, size:100})
        console.log('商品列表响应:', result)

        if (result.code === 0) {
          // 转换数据结构以匹配 ProductCard 组件的期望格式
          this.featuredProducts = result.data.records.map(item => ({
            id: item.productId,
            name: item.name,
            image: item.imgUrl,
            code: item.code,
            price: item.salePrice,
            costPrice:item.costPrice,
            sales:item.saleNum

          }))
          console.log('处理后的商品数据:', this.featuredProducts)
        } else {
          console.error('API返回错误:', result.msg)
        }
      } catch (error) {
        console.error('获取商品列表失败2:', error)
      }
    }
  }
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 60px 20px;
  margin-bottom: 40px;
}

.hero-section h1 {
  font-size: 48px;
  margin-bottom: 16px;
}

.featured-products h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 32px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 0 20px;
}
</style>

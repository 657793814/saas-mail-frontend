<!-- src/components/ProductCard.vue -->
<template>
  <div class="product-card" @click="viewDetail">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" @error="handleImageError">
    </div>
    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-price">¥{{ product.price }}</div>
      <div class="product-meta">
        <span class="sales">销量: {{ product.sales || 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/300x300?text=商品图片';
    },
    viewDetail() {
      // 点击商品卡片时跳转到详情页
      this.$router.push(`/product/${this.product.id}`);
      // 或者通过事件通知父组件
      this.$emit('view-detail', this.product);
    }
  }
}
</script>

<style scoped>
.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  margin: 0 0 10px 0;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 18px;
  color: #ff6700;
  font-weight: bold;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sales {
  font-size: 12px;
  color: #999;
}
</style>

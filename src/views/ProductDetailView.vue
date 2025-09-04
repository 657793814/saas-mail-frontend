<!-- src/views/ProductDetailView.vue -->
<template>
  <div class="product-detail-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>正在加载商品信息...</p>
    </div>

    <div v-else-if="product" class="product-content">
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <router-link to="/">首页</router-link>
        <span> > </span>
        <router-link to="/products">商品中心</router-link>
        <span> > </span>
        <span>{{ product.title || '商品详情' }}</span>
      </div>

      <!-- 商品详情主体 -->
      <div class="product-detail">
        <!-- 商品图片展示区 -->
        <div class="product-images">
          <div class="main-image-container" ref="imageContainer">
            <div
                class="main-image"
                @mouseenter="handleMouseEnter"
                @mouseleave="handleMouseLeave"
                @mousemove="handleMouseMove"
            >
              <img :src="currentImage" :alt="product.title" @error="handleImageError">
              <!-- 放大镜遮罩 -->
              <div
                  v-show="showMagnifier"
                  class="magnifier-mask"
                  :style="magnifierMaskStyle"
              ></div>
            </div>

            <!-- 放大镜预览区域 -->
            <div
                v-show="showMagnifier"
                class="magnifier-preview"
                :style="magnifierPreviewStyle"
            >
              <img
                  :src="currentImage"
                  :style="magnifierImageStyle"
                  @error="handleImageError"
              />
            </div>
          </div>

          <!-- 缩略图滑动窗口 -->
          <div class="thumbnail-slider">
            <button
                v-if="product.imageUrls && product.imageUrls.length > 4"
                class="slider-btn prev-btn"
                @click="slideThumbnails('prev')"
                :disabled="thumbnailStartIndex === 0"
            >
              &lt;
            </button>

            <div class="thumbnail-images-container">
              <div class="thumbnail-images" :style="thumbnailSliderStyle">
                <img
                    v-for="(img, index) in product.imageUrls"
                    :key="index"
                    :src="img.url"
                    :alt="`缩略图${index + 1}`"
                    @click="switchMainImage(img.url)"
                    class="thumbnail"
                    :class="{ active: currentImage === img.url }"
                >
              </div>
            </div>

            <button
                v-if="product.imageUrls && product.imageUrls.length > 4"
                class="slider-btn next-btn"
                @click="slideThumbnails('next')"
                :disabled="thumbnailStartIndex >= product.imageUrls.length - 4"
            >
              &gt;
            </button>
          </div>
        </div>

        <!-- 商品信息区 -->
        <div class="product-info">
          <h1 class="product-title">{{ product.title }}</h1>

          <div class="product-meta">
            <div class="product-price">
              <span class="current-price">¥{{ currentSku?.price || product.skus[0]?.price || 0 }}</span>
              <span v-if="currentSku?.costPrice" class="original-price">¥{{ currentSku.costPrice }}</span>
            </div>

            <div class="product-stock">
              <span>库存: {{ currentSku?.stock || 0 }}件</span>
            </div>
          </div>

          <div class="product-description">
            <p>{{ product.summary || '暂无商品简介' }}</p>
          </div>

          <!-- SKU选择区 -->
          <div v-if="skuSpecifications.length > 0" class="sku-selection">
            <div
                v-for="spec in skuSpecifications"
                :key="spec.specId"
                class="spec-group"
            >
              <div class="spec-name">{{ spec.specName }}:</div>
              <div class="spec-values">
                <button
                    v-for="value in spec.values"
                    :key="value.valueId"
                    :class="{
                    'spec-btn': true,
                    'selected': selectedSpecs[spec.specId] === value.valueId,
                    'disabled': isSpecDisabled(spec.specId, value.valueId)
                  }"
                    @click="selectSpec(spec.specId, value.valueId)"
                >
                  {{ value.value }}
                </button>
              </div>
            </div>
          </div>

          <div class="product-actions">
            <div class="quantity-selector">
              <label>数量:</label>
              <div class="quantity-controls">
                <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
                <input
                    type="number"
                    v-model.number="quantity"
                    min="1"
                    :max="currentSku?.stock || 999"
                    class="quantity-input"
                >
                <button @click="increaseQuantity" :disabled="quantity >= (currentSku?.stock || 999)">+</button>
              </div>
              <span class="stock-info">剩余{{ currentSku?.stock || 0 }}件</span>
            </div>

            <div class="action-buttons">
              <button @click="addToCart" class="add-to-cart-btn">
                加入购物车
              </button>
              <button @click="buyNow" class="buy-now-btn">
                立即购买
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品详情介绍 -->
      <div class="product-details-section">
        <div class="section-tabs">
          <button
              v-for="tab in detailTabs"
              :key="tab.id"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
              class="tab-button"
          >
            {{ tab.name }}
          </button>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'description'" class="description-content">
            <div class="detail-description" v-html="product.description || '暂无详细描述'">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 购物车提示模态框 -->
    <div v-if="showCartModal" class="modal-overlay" @click="closeCartModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加成功</h3>
          <button class="close-btn" @click="closeCartModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>商品已成功加入购物车</p>
          <div class="cart-item-preview">
            <img :src="currentImage" :alt="product.title" class="preview-image">
            <div class="item-details">
              <h4>{{ product.title }}</h4>
              <p>规格: {{ selectedSkuSpecs }}</p>
              <p>数量: {{ quantity }}</p>
              <p>价格: ¥{{ (currentSku?.price || product.skus[0]?.price || 0) * quantity }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="continueShopping" class="continue-btn">继续购物</button>
          <button @click="goToCart" class="goto-cart-btn">去购物车结算</button>
        </div>
      </div>
    </div>

    <!-- 确认购买模态框 -->
    <div v-if="showBuyModal" class="modal-overlay" @click="closeBuyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>确认购买</h3>
          <button class="close-btn" @click="closeBuyModal">&times;</button>
        </div>
        <div class="modal-body">
          <p>请确认购买以下商品:</p>
          <div class="cart-item-preview">
            <img :src="currentImage" :alt="product.title" class="preview-image">
            <div class="item-details">
              <h4>{{ product.title }}</h4>
              <p>规格: {{ selectedSkuSpecs }}</p>
              <p>数量: {{ quantity }}</p>
              <p>价格: ¥{{ (currentSku?.price || product.skus[0]?.price || 0) * quantity }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeBuyModal" class="cancel-btn">取消</button>
          <button @click="confirmPurchase" class="confirm-btn">确认购买</button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-toast" @click="errorMessage = ''">
      {{ errorMessage }}
    </div>

    <!-- 商品未找到页面 -->
    <div v-else-if="!loading && !product" class="error-container">
      <div class="error-icon">❌</div>
      <h3>商品未找到</h3>
      <p>抱歉，未找到您要查看的商品。</p>
      <router-link to="/products" class="back-link">返回商品中心</router-link>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/utils/request";

export default {
  name: 'ProductDetailView',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: true,
      product: null,
      quantity: 1,
      activeTab: 'description',
      detailTabs: [
        { id: 'description', name: '商品详情' }
      ],
      selectedSpecs: {}, // 存储用户选择的规格
      currentImage: '', // 当前显示的主图

      // 放大镜相关数据
      showMagnifier: false,
      magnifierPosition: { x: 0, y: 0 },
      magnifierSize: 180,
      imageContainerRect: null,
      zoomRatio: 2, // 放大倍数

      // 缩略图滑动相关
      thumbnailStartIndex: 0,

      // 模态框相关
      showCartModal: false,
      showBuyModal: false,

      // 错误信息
      errorMessage: ''
    }
  },

  computed: {
    // 放大镜遮罩样式
    magnifierMaskStyle() {
      return {
        width: this.magnifierSize + 'px',
        height: this.magnifierSize + 'px',
        left: (this.magnifierPosition.x - this.magnifierSize / 2) + 'px',
        top: (this.magnifierPosition.y - this.magnifierSize / 2) + 'px'
      };
    },

    // 放大镜预览区域样式
    magnifierPreviewStyle() {
      return {
        width: '450px',
        height: '450px',
        left: '120%',
        top: '0'
      };
    },

    // 放大镜图片样式（修复比例问题）
    magnifierImageStyle() {
      if (!this.imageContainerRect) return {};

      return {
        position: 'absolute',
        width: this.imageContainerRect.width * this.zoomRatio + 'px',
        height: this.imageContainerRect.height * this.zoomRatio + 'px',
        left: -this.magnifierPosition.x * this.zoomRatio + this.magnifierSize / 2 * this.zoomRatio + 'px',
        top: -this.magnifierPosition.y * this.zoomRatio + this.magnifierSize / 2 * this.zoomRatio + 'px',
        maxWidth: 'none'
      };
    },

    // 缩略图滑动样式
    thumbnailSliderStyle() {
      return {
        transform: `translateX(-${this.thumbnailStartIndex * 90}px)`,
        transition: 'transform 0.3s ease'
      };
    },

    // 当前选中的SKU
    currentSku() {
      if (!this.product || !this.product.skus) return null;

      // 查找完全匹配的SKU
      return this.product.skus.find(sku => {
        return sku.specifications.every(spec =>
            this.selectedSpecs[spec.specId] === spec.valueId
        );
      }) || this.product.skus[0]; // 默认返回第一个SKU
    },

    // SKU规格分组
    skuSpecifications() {
      if (!this.product || !this.product.skus || this.product.skus.length === 0) {
        return [];
      }

      const specs = {};

      // 遍历所有SKU的规格
      this.product.skus.forEach(sku => {
        sku.specifications.forEach(spec => {
          if (!specs[spec.specId]) {
            specs[spec.specId] = {
              specId: spec.specId,
              specName: spec.specName,
              values: {}
            };
          }
          // 使用valueId作为key避免重复
          specs[spec.specId].values[spec.valueId] = {
            valueId: spec.valueId,
            value: spec.value
          };
        });
      });

      // 转换为数组格式
      return Object.values(specs).map(spec => ({
        ...spec,
        values: Object.values(spec.values)
      }));
    },

    // 选中SKU的规格描述
    selectedSkuSpecs() {
      if (!this.currentSku) return '未选择规格';

      return this.currentSku.specifications
          .map(spec => `${spec.specName}: ${spec.value}`)
          .join(', ');
    }
  },

  methods: {
    async loadProduct() {
      this.loading = true;
      try {
        const result = await apiRequest.post("/api/product_detail", {
          id: this.id
        });

        if (result.code === 0) {
          this.product = result.data;

          // 将所有SKU的图片整合
          this.integrateSkuImages();

          // 初始化默认选中的规格（选择第一个SKU的规格）
          if (this.product.skus && this.product.skus.length > 0) {
            const firstSku = this.product.skus[0];
            firstSku.specifications.forEach(spec => {
              // Vue 3 中直接赋值即可，无需使用 $set
              this.selectedSpecs[spec.specId] = spec.valueId;
            });

            // 设置默认主图
            this.currentImage = firstSku.imageObj?.url ||
                (this.product.imageUrls && this.product.imageUrls[0]?.url) ||
                'https://via.placeholder.com/400x400?text=商品图片';
          }
        } else {
          console.error('获取商品详情失败:', result.msg);
          this.product = null;
        }
      } catch (error) {
        console.error('加载商品详情出错:', error);
        this.product = null;
      } finally {
        this.loading = false;
      }
    },

    integrateSkuImages() {
      if (!this.product || !this.product.skus) return;

      // 创建一个Set来存储唯一的图片URL
      const uniqueImages = new Set();
      const skuImages = [];

      // 收集所有SKU的图片
      this.product.skus.forEach(sku => {
        if (sku.imageObj && sku.imageObj.url) {
          // 使用Set确保图片URL唯一
          if (!uniqueImages.has(sku.imageObj.url)) {
            uniqueImages.add(sku.imageObj.url);
            skuImages.push({
              url: sku.imageObj.url,
              skuId: sku.skuId
            });
          }
        }
      });

      // 合并product.imageUrls和SKU图片
      const productImages = this.product.imageUrls ? [...this.product.imageUrls] : [];

      // 将唯一的SKU图片添加到产品图片列表中
      skuImages.forEach(skuImage => {
        if (!productImages.some(img => img.url === skuImage.url)) {
          productImages.push({
            url: skuImage.url
          });
        }
      });

      // 更新product.images
      this.product.imageUrls = productImages;
    },

    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/400x400?text=商品图片';
    },

    switchMainImage(imageUrl) {
      this.currentImage = imageUrl;
    },

    // 选择规格
    selectSpec(specId, valueId) {
      // 如果点击的是已选中的规格，则不处理
      if (this.selectedSpecs[specId] === valueId) return;

      // 更新选中规格 (Vue 3 中直接赋值即可)
      this.selectedSpecs[specId] = valueId;

      // 更新主图（如果有对应SKU的图片）
      const matchedSku = this.product.skus.find(sku =>
          sku.specifications.every(spec =>
              this.selectedSpecs[spec.specId] === spec.valueId
          )
      );

      if (matchedSku && matchedSku.imageObj) {
        this.currentImage = matchedSku.imageObj.url;
      }

      // 重置数量为1
      this.quantity = 1;
    },

    // 判断规格是否禁用
    isSpecDisabled(specId, valueId) {
      // 创建一个临时的规格选择对象
      const tempSpecs = { ...this.selectedSpecs, [specId]: valueId };

      // 检查是否存在匹配的SKU
      return !this.product.skus.some(sku =>
          sku.specifications.every(spec =>
              tempSpecs[spec.specId] === spec.valueId
          )
      );
    },

    increaseQuantity() {
      if (this.currentSku && this.quantity < (this.currentSku.stock || 999)) {
        this.quantity++;
      }
    },

    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },

    addToCart() {
      // 检查是否选择了完整的规格
      if (!this.currentSku) {
        this.errorMessage = '请选择完整的商品规格';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
        return;
      }

      // 检查库存
      if (this.quantity > (this.currentSku.stock || 0)) {
        this.errorMessage = '购买数量超过库存';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
        return;
      }

      // 构造购物车项目
      const cartItem = {
        productId: this.product.id,
        skuId: this.currentSku.skuId,
        title: this.product.title,
        price: this.currentSku.price,
        image: this.currentImage,
        quantity: this.quantity,
        specifications: this.currentSku.specifications,
        stock: this.currentSku.stock
      };

      try {
        // 添加到购物车（这里模拟添加到本地存储）
        let cart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');

        // 检查是否已存在相同商品和规格
        const existingItemIndex = cart.findIndex(item =>
            item.skuId === cartItem.skuId
        );

        if (existingItemIndex > -1) {
          // 如果已存在，增加数量
          const newQuantity = cart[existingItemIndex].quantity + cartItem.quantity;
          if (newQuantity <= cart[existingItemIndex].stock) {
            cart[existingItemIndex].quantity = newQuantity;
          } else {
            this.errorMessage = '购物车中该商品数量已超过库存';
            setTimeout(() => {
              this.errorMessage = '';
            }, 3000);
            return;
          }
        } else {
          // 如果不存在，添加新项目
          cart.push(cartItem);
        }

        // 保存到本地存储
        localStorage.setItem('shoppingCart', JSON.stringify(cart));

        // 显示成功提示
        this.showCartModal = true;

        // 触发购物车更新事件
        this.dispatchCartUpdateEvent();
      } catch (error) {
        console.error('添加购物车失败:', error);
        this.errorMessage = '添加购物车失败，请重试';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    },

    // 添加触发购物车更新事件的方法
    dispatchCartUpdateEvent() {
      // 创建并派发自定义事件，通知其他组件购物车已更新
      const event = new CustomEvent('cart-updated')
      document.dispatchEvent(event)
    },

    buyNow() {
      // 检查是否选择了完整的规格
      if (!this.currentSku) {
        this.errorMessage = '请选择完整的商品规格';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
        return;
      }

      // 检查库存
      if (this.quantity > (this.currentSku.stock || 0)) {
        this.errorMessage = '购买数量超过库存';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
        return;
      }

      // 显示确认购买模态框
      this.showBuyModal = true;
    },

    // 模态框相关方法
    closeCartModal() {
      this.showCartModal = false;
    },

    closeBuyModal() {
      this.showBuyModal = false;
    },

    continueShopping() {
      this.closeCartModal();
    },

    goToCart() {
      this.closeCartModal();
      this.$router.push('/cart');
    },

    confirmPurchase() {
      // 构造购买项目
      const purchaseItem = {
        productId: this.product.id,
        skuId: this.currentSku.skuId,
        title: this.product.title,
        price: this.currentSku.price,
        image: this.currentImage,
        quantity: this.quantity,
        specifications: this.currentSku.specifications,
        stock: this.currentSku.stock
      };

      // 关闭模态框
      this.closeBuyModal();

      // 跳转到结算页面（这里模拟直接跳转）
      // 实际项目中可能需要调用API创建订单
      this.$router.push({
        path: '/checkout',
        query: {
          items: JSON.stringify([purchaseItem])
        }
      });
    },

    // 放大镜相关方法
    handleMouseEnter() {
      this.showMagnifier = true;
      this.$nextTick(() => {
        this.imageContainerRect = this.$refs.imageContainer.querySelector('.main-image').getBoundingClientRect();
      });
    },

    handleMouseLeave() {
      this.showMagnifier = false;
    },

    handleMouseMove(event) {
      if (!this.imageContainerRect) return;

      const rect = this.imageContainerRect;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 限制鼠标位置在图片范围内
      this.magnifierPosition.x = Math.max(this.magnifierSize / 2,
          Math.min(x, rect.width - this.magnifierSize / 2));
      this.magnifierPosition.y = Math.max(this.magnifierSize / 2,
          Math.min(y, rect.height - this.magnifierSize / 2));
    },

    // 缩略图滑动方法
    slideThumbnails(direction) {
      if (!this.product || !this.product.imageUrls) return;

      const maxIndex = this.product.imageUrls.length - 4;

      if (direction === 'prev') {
        this.thumbnailStartIndex = Math.max(0, this.thumbnailStartIndex - 1);
      } else {
        this.thumbnailStartIndex = Math.min(maxIndex, this.thumbnailStartIndex + 1);
      }
    }
  },

  mounted() {
    this.loadProduct();
  },

  watch: {
    id: {
      handler() {
        this.loadProduct();
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.product-detail-page {
  min-height: calc(100vh - 120px);
  background-color: #f5f5f5;
  padding: 20px 0;
  position: relative;
}

.loading-container, .error-container {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin: 20px auto;
  max-width: 1200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.back-link:hover {
  background-color: #0056b3;
}

.breadcrumb {
  max-width: 1200px;
  margin: 0 auto 20px;
  padding: 0 20px;
  font-size: 14px;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb span {
  color: #666;
}

.product-detail {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto 30px;
  padding: 0 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  padding: 30px;
}

.product-images {
  flex: 0 0 400px;
  width:40%;
}

.main-image-container {
  position: relative;
}

.main-image {
  position: relative;
  width: 100%;
  height: 450px;
  overflow: hidden;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  cursor: crosshair;
}

/* 放大镜遮罩样式 */
.magnifier-mask {
  position: absolute;
  border: 1px solid #ccc;
  background-color: rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  cursor: crosshair;
  pointer-events: none;
  z-index: 10;
  backdrop-filter: blur(1px);
}

/* 放大镜预览区域样式 */
.magnifier-preview {
  position: absolute;
  border: 1px solid #ddd;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 100;
  border-radius: 4px;
}

.magnifier-preview img {
  position: absolute;
  display: block;
  object-fit: contain;
}

/* 缩略图滑动窗口样式 */
.thumbnail-slider {
  display: flex;
  align-items: center;
  margin-top: 15px;
  position: relative;
}

.slider-btn {
  width: 30px;
  height: 80px;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background-color 0.3s;
  z-index: 2;
}

.slider-btn:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.5);
}

.slider-btn:disabled {
  background-color: rgba(0, 0, 0, 0.1);
  cursor: not-allowed;
}

.prev-btn {
  border-radius: 4px 0 0 4px;
}

.next-btn {
  border-radius: 0 4px 4px 0;
}

.thumbnail-images-container {
  flex: 1;
  overflow: hidden;
  height: 80px;
}

.thumbnail-images {
  display: flex;
  gap: 10px;
  height: 100%;
  align-items: center;
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.3s;
  flex-shrink: 0;
}

.thumbnail:hover {
  border-color: #007bff;
}

.thumbnail.active {
  border-color: #007bff;
  box-shadow: 0 0 0 2px #007bff;
}

.product-info {
  flex: 1;
}

.product-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.product-meta {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  margin-bottom: 10px;
}

.current-price {
  font-size: 28px;
  color: #ff6700;
  font-weight: bold;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
  margin-left: 10px;
}

.product-stock {
  color: #666;
  font-size: 14px;
}

.product-description p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* SKU选择区样式 */
.sku-selection {
  margin: 20px 0;
  padding: 20px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.spec-group {
  margin-bottom: 15px;
}

.spec-name {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.spec-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.spec-btn:hover:not(.disabled) {
  border-color: #007bff;
  background-color: #e3f2fd;
}

.spec-btn.selected {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.spec-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f5f5f5;
  color: #999;
}

.product-actions {
  margin: 30px 0;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.quantity-selector label {
  font-weight: bold;
  color: #333;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity-controls button {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-controls button:hover:not(:disabled) {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.quantity-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 60px;
  height: 36px;
  border: 1px solid #ddd;
  text-align: center;
  font-size: 16px;
}

.stock-info {
  color: #999;
  font-size: 14px;
  margin-left: 10px;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.add-to-cart-btn, .buy-now-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-to-cart-btn {
  background-color: #ff9800;
  color: white;
}

.add-to-cart-btn:hover {
  background-color: #f57c00;
}

.buy-now-btn {
  background-color: #ff5722;
  color: white;
}

.buy-now-btn:hover {
  background-color: #e64a19;
}

.product-details-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.section-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-button {
  padding: 15px 30px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-bottom: 3px solid transparent;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
  font-weight: bold;
}

.tab-button:hover:not(.active) {
  color: #333;
  background-color: #f8f9fa;
}

.tab-content {
  padding: 30px;
}

.detail-description {
  line-height: 1.8;
  color: #333;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 500px;
  max-width: 90%;
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
}

.cart-item-preview {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.item-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.modal-footer button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.continue-btn, .cancel-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.continue-btn:hover, .cancel-btn:hover {
  background-color: #e9ecef;
}

.goto-cart-btn, .confirm-btn {
  background-color: #007bff;
  color: white;
}

.goto-cart-btn:hover, .confirm-btn:hover {
  background-color: #0056b3;
}

.confirm-btn {
  background-color: #28a745;
}

.confirm-btn:hover {
  background-color: #218838;
}

/* 错误提示样式 */
.error-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1001;
  cursor: pointer;
  animation: fadeInOut 3s forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; top: 0; }
  10% { opacity: 1; top: 20px; }
  90% { opacity: 1; top: 20px; }
  100% { opacity: 0; top: 0; }
}

@media (max-width: 992px) {
  .product-detail {
    flex-direction: column;
  }

  .product-images {
    flex: none;
  }

  .section-tabs {
    overflow-x: auto;
  }

  .tab-button {
    white-space: nowrap;
  }

  .magnifier-preview {
    display: none;
  }

  .main-image {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .product-detail-page {
    padding: 10px 0;
  }

  .product-detail {
    padding: 15px;
  }

  .product-content {
    padding: 0 10px;
  }

  .main-image {
    height: 300px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .tab-content {
    padding: 15px;
  }

  .spec-values {
    gap: 8px;
  }

  .spec-btn {
    padding: 6px 12px;
    font-size: 14px;
  }

  .thumbnail-slider {
    margin-top: 10px;
  }

  .slider-btn {
    width: 25px;
    height: 70px;
    font-size: 16px;
  }

  .thumbnail {
    width: 70px;
    height: 70px;
  }

  .cart-item-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .preview-image {
    width: 100px;
    height: 100px;
  }
}
</style>

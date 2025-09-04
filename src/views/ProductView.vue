<template>
  <div class="products-page">
    <!-- 搜索和筛选区域 -->
    <div class="products-header">
      <div class="header-content">
        <h1 class="page-title">商品中心</h1>

        <div class="search-section">
          <div class="search-box">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索商品..."
                class="search-input"
                @keyup.enter="searchProducts"
            >
            <button @click="searchProducts" class="search-btn">
              <i class="search-icon">🔍</i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和排序区域 -->
    <div class="filter-sort-section">
      <div class="filters">
        <div class="filter-group category-dropdown" @mouseenter="showCategoryDropdown = true" @mouseleave="showCategoryDropdown = false">
          <label>分类:</label>
          <div class="category-selector">
            <span class="selected-category">{{ selectedCategoryName || '全部分类' }}</span>
            <i class="arrow-down">▼</i>
          </div>

          <!-- 分类悬浮层 -->
          <div v-show="showCategoryDropdown" class="category-dropdown-menu" @mouseenter="showCategoryDropdown = true" @mouseleave="showCategoryDropdown = false">
            <div class="category-dropdown-content">
              <!-- 一级分类 -->
              <div class="category-level">
                <div class="category-level-title">一级分类</div>
                <ul class="category-list">
                  <li
                      :class="{ active: !selectedFirstLevel }"
                      @click="selectCategoryLevel('', 1)"
                      class="category-item"
                  >
                    全部分类
                  </li>
                  <li
                      v-for="category in firstLevelCategories"
                      :key="category.id"
                      :class="{ active: selectedFirstLevel === category.id }"
                      @click="selectCategoryLevel(category.id, 1)"
                      class="category-item"
                  >
                    {{ category.name }}
                  </li>
                </ul>
              </div>

              <!-- 二级分类 -->
              <div v-if="secondLevelCategories && secondLevelCategories.length > 0" class="category-level">
                <div class="category-level-title">二级分类</div>
                <ul class="category-list">
                  <li
                      :class="{ active: !selectedSecondLevel }"
                      @click="selectCategoryLevel('', 2)"
                      class="category-item"
                  >
                    全部
                  </li>
                  <li
                      v-for="category in secondLevelCategories"
                      :key="category.id"
                      :class="{ active: selectedSecondLevel === category.id }"
                      @click="selectCategoryLevel(category.id, 2)"
                      class="category-item"
                  >
                    {{ category.name }}
                  </li>
                </ul>
              </div>

              <!-- 三级分类 -->
              <div v-if="thirdLevelCategories && thirdLevelCategories.length > 0" class="category-level">
                <div class="category-level-title">三级分类</div>
                <ul class="category-list">
                  <li
                      :class="{ active: !selectedThirdLevel }"
                      @click="selectCategoryLevel('', 3)"
                      class="category-item"
                  >
                    全部
                  </li>
                  <li
                      v-for="category in thirdLevelCategories"
                      :key="category.id"
                      :class="{ active: selectedThirdLevel === category.id }"
                      @click="selectCategoryLevel(category.id, 3)"
                      class="category-item"
                  >
                    {{ category.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="filter-group">
          <label>价格区间:</label>
          <div class="price-range">
            <input
                v-model.number="priceRange.min"
                type="number"
                placeholder="最低价"
                class="price-input"
            >
            <span>-</span>
            <input
                v-model.number="priceRange.max"
                type="number"
                placeholder="最高价"
                class="price-input"
            >
          </div>
        </div>

        <button @click="applyFilters" class="apply-filters-btn">
          应用筛选
        </button>

        <button @click="resetFilters" class="reset-filters-btn">
          重置
        </button>
      </div>

      <div class="sort-section">
        <label>排序:</label>
        <select v-model="sortOption" @change="sortProducts">
          <option value="default">默认排序</option>
          <option value="price-low">价格从低到高</option>
          <option value="price-high">价格从高到低</option>
          <option value="name">按名称排序</option>
          <option value="sales">按销量排序</option>
        </select>
      </div>
    </div>

    <!-- 商品展示区域 -->
    <div class="products-main">
      <!-- 商品列表 -->
      <div class="products-content">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>正在加载商品...</p>
        </div>

        <div v-else-if="paginatedProducts && paginatedProducts.length === 0" class="no-products">
          <div class="no-products-icon">📦</div>
          <h3>没有找到相关商品</h3>
          <p>试试调整筛选条件或搜索关键词</p>
          <button @click="resetFilters" class="reset-search-btn">
            重置搜索
          </button>
        </div>

        <div v-else>
          <div class="products-grid">
            <ProductCard
                v-for="product in paginatedProducts"
                :key="product.id"
                :product="product"
                @view-detail="viewProductDetail"
            />
          </div>

          <!-- 分页组件 -->
          <div class="pagination">
            <button
                :disabled="currentPage === 1"
                @click="prevPage"
                class="page-btn"
            >
              上一页
            </button>

            <div class="page-numbers">
              <button
                  v-for="page in visiblePages"
                  :key="page"
                  :class="{ active: page === currentPage }"
                  @click="goToPage(page)"
                  class="page-number"
              >
                {{ page }}
              </button>
            </div>

            <button
                :disabled="currentPage === totalPages"
                @click="nextPage"
                class="page-btn"
            >
              下一页
            </button>

            <div class="page-info">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
              (共 {{ filteredProductsCache && filteredProductsCache.length || 0 }} 件商品)
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import apiRequest from "@/utils/request";

export default {
  name: 'ProductView',
  components: {
    ProductCard
  },
  data() {
    return {
      loading: true,
      searchQuery: '',
      selectedCategory: '', // 用于筛选的最终分类ID
      selectedFirstLevel: '', // 选中的一级分类
      selectedSecondLevel: '', // 选中的二级分类
      selectedThirdLevel: '', // 选中的三级分类
      selectedCategoryName: '', // 选中分类的名称
      showCategoryDropdown: false, // 控制分类悬浮层显示
      sortOption: 'default',
      priceRange: {
        min: 0,
        max: 10000
      },
      maxPrice: 10000,
      currentPage: 1,
      itemsPerPage: 12,
      allProducts: [],
      allCategories: [], // 所有分类数据
      firstLevelCategories: [], // 一级分类
      secondLevelCategories: [], // 二级分类
      thirdLevelCategories: [], // 三级分类
      filteredProductsCache: [] // 缓存筛选结果
    }
  },

  computed: {
    // 筛选后的商品
    filteredProducts() {
      if (!this.allProducts || !Array.isArray(this.allProducts)) {
        return [];
      }

      let result = [...this.allProducts]

      // 搜索筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(product =>
            product.name && product.name.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query)) ||
            (product.category && product.category.toLowerCase().includes(query))
        )
      }

      // 分类筛选
      if (this.selectedCategory) {
        result = result.filter(product =>
            product.categoryId == this.selectedCategory // 使用 == 因为可能涉及类型转换
        )
      }

      // 价格筛选
      result = result.filter(product =>
          product.price >= this.priceRange.min &&
          product.price <= this.priceRange.max
      )

      // 排序
      this.sortProductsArray(result)

      return result
    },

    // 当前页商品
    paginatedProducts() {
      if (!this.filteredProductsCache || !Array.isArray(this.filteredProductsCache)) {
        return [];
      }

      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      const endIndex = startIndex + this.itemsPerPage
      return this.filteredProductsCache.slice(startIndex, endIndex)
    },

    // 总页数
    totalPages() {
      if (!this.filteredProductsCache || !Array.isArray(this.filteredProductsCache)) {
        return 0;
      }
      return Math.ceil(this.filteredProductsCache.length / this.itemsPerPage)
    },

    // 可见页码
    visiblePages() {
      if (!this.filteredProductsCache || !Array.isArray(this.filteredProductsCache)) {
        return [];
      }

      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    }
  },

  methods: {
    async loadProducts() {
      this.loading = true
      try {
        // 先加载分类数据
        await this.loadCategories()

        // 使用正确的API请求方式
        const postData = {
          current: 1,
          size: 100 // 获取足够多的商品用于展示
        }

        const result = await apiRequest.post("/api/product_list", postData)

        if (result.code === 0) {
          // 正确映射API返回的数据结构
          this.allProducts = result.data.records.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.salePrice || 0,
            image: item.imgUrl,
            categoryId: item.categoryId || 0,
            category: this.getCategoryPath(item.categoryId) || '默认分类',
            description: item.description || '',
            sales: item.saleNum || 0
          }))

          // 计算最大价格用于价格筛选
          if (this.allProducts.length > 0) {
            this.maxPrice = Math.max(...this.allProducts.map(p => p.price))
            this.priceRange.max = this.maxPrice
          }

          // 初始加载完成后进行一次筛选
          this.applyFilters()
        } else {
          console.error('API返回错误:', result.msg)
        }

        this.loading = false
      } catch (error) {
        console.error('加载商品失败:', error)
        this.loading = false
      }
    },

    // 加载分类数据
    async loadCategories() {
      try {
        const result = await apiRequest.post("/api/category_list")

        if (result.code === 0) {
          this.allCategories = result.data || []
          // 初始化一级分类
          this.firstLevelCategories = this.allCategories.filter(cat => cat.level === 1)
        } else {
          console.error('加载分类失败:', result.msg)
        }
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },

    // 获取分类的完整路径名称
    getCategoryPath(categoryId) {
      if (!categoryId || !this.allCategories || !Array.isArray(this.allCategories)) return '默认分类'

      const category = this.allCategories.find(cat => cat.id === categoryId)
      if (!category) return '默认分类'

      if (category.level === 1) {
        return category.name
      } else if (category.level === 2) {
        const parent = this.allCategories.find(cat => cat.id === category.parentId)
        return parent ? `${parent.name} > ${category.name}` : category.name
      } else if (category.level === 3) {
        const parent = this.allCategories.find(cat => cat.id === category.parentId)
        if (parent) {
          const grandParent = this.allCategories.find(cat => cat.id === parent.parentId)
          if (grandParent) {
            return `${grandParent.name} > ${parent.name} > ${category.name}`
          }
          return `${parent.name} > ${category.name}`
        }
        return category.name
      }

      return category.name
    },

    // 选择分类级别
    selectCategoryLevel(categoryId, level) {
      // 确保 allCategories 存在
      if (!this.allCategories || !Array.isArray(this.allCategories)) {
        this.allCategories = [];
      }

      switch (level) {
        case 1:
          this.selectedFirstLevel = categoryId
          this.selectedSecondLevel = ''
          this.selectedThirdLevel = ''
          this.selectedCategoryName = categoryId ?
              this.allCategories.find(cat => cat && cat.id === categoryId)?.name : ''
          // 更新二级分类
          if (categoryId) {
            this.secondLevelCategories = this.allCategories.filter(
                cat => cat && cat.level === 2 && cat.parentId === categoryId
            )
          } else {
            this.secondLevelCategories = []
          }
          this.thirdLevelCategories = []
          break
        case 2:
          this.selectedSecondLevel = categoryId
          this.selectedThirdLevel = ''
          this.selectedCategoryName = categoryId ?
              this.allCategories.find(cat => cat && cat.id === categoryId)?.name :
              (this.selectedFirstLevel ?
                  this.allCategories.find(cat => cat && cat.id === this.selectedFirstLevel)?.name : '')
          // 更新三级分类
          if (categoryId) {
            this.thirdLevelCategories = this.allCategories.filter(
                cat => cat && cat.level === 3 && cat.parentId === categoryId
            )
          } else {
            this.thirdLevelCategories = []
          }
          break
        case 3:
          this.selectedThirdLevel = categoryId
          this.selectedCategoryName = categoryId ?
              this.allCategories.find(cat => cat && cat.id === categoryId)?.name :
              (this.selectedSecondLevel ?
                  this.allCategories.find(cat => cat && cat.id === this.selectedSecondLevel)?.name :
                  (this.selectedFirstLevel ?
                      this.allCategories.find(cat => cat && cat.id === this.selectedFirstLevel)?.name : ''))
          break
      }

      // 设置最终选中的分类ID用于筛选
      this.selectedCategory = categoryId || this.selectedSecondLevel || this.selectedFirstLevel || ''

      this.showCategoryDropdown = false
      this.applyFilters()
    },

    // 应用所有筛选条件
    applyFilters() {
      // 确保 allProducts 存在
      if (!this.allProducts || !Array.isArray(this.allProducts)) {
        this.filteredProductsCache = [];
        return;
      }

      let result = [...this.allProducts]

      // 搜索筛选
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(product =>
            product.name && product.name.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query)) ||
            (product.category && product.category.toLowerCase().includes(query))
        )
      }

      // 分类筛选
      if (this.selectedCategory) {
        result = result.filter(product =>
            product.categoryId == this.selectedCategory // 使用 == 因为可能涉及类型转换
        )
      }

      // 价格筛选
      result = result.filter(product =>
          product.price >= this.priceRange.min &&
          product.price <= this.priceRange.max
      )

      // 排序
      this.sortProductsArray(result)

      // 更新缓存
      this.filteredProductsCache = result
      this.currentPage = 1
    },

    searchProducts() {
      this.currentPage = 1
      this.applyFilters()
    },

    resetFilters() {
      this.searchQuery = ''
      this.selectedCategory = ''
      this.selectedCategoryName = ''
      this.selectedFirstLevel = ''
      this.selectedSecondLevel = ''
      this.selectedThirdLevel = ''
      this.secondLevelCategories = []
      this.thirdLevelCategories = []
      this.priceRange = {min: 0, max: this.maxPrice}
      this.sortOption = 'default'
      this.currentPage = 1
      this.applyFilters()
    },

    sortProductsArray(array) {
      if (!array || !Array.isArray(array)) return;

      switch (this.sortOption) {
        case 'price-low':
          array.sort((a, b) => (a.price || 0) - (b.price || 0))
          break
        case 'price-high':
          array.sort((a, b) => (b.price || 0) - (a.price || 0))
          break
        case 'name':
          array.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          break
        case 'sales':
          array.sort((a, b) => (b.sales || 0) - (a.sales || 0))
          break
        default:
          // 默认按ID排序
          array.sort((a, b) => (a.id || 0) - (b.id || 0))
      }
    },

    sortProducts() {
      this.currentPage = 1
      this.applyFilters()
    },

    viewProductDetail(product) {
      this.$router.push(`/product/${product.id}`)
    },

    // 分页方法
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    nextPage() {
      if (this.totalPages && this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    goToPage(page) {
      this.currentPage = page
    }
  },

  mounted() {
    this.loadProducts()
  }
}
</script>

<style scoped>
.products-page {
  min-height: calc(100vh - 120px);
  background-color: #f5f5f5;
}

.products-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 0;
  color: white;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 32px;
  margin-bottom: 20px;
}

.search-section {
  max-width: 500px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
}

.search-btn {
  background-color: #ff6700;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #e55d00;
}

.filter-sort-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
  z-index: 10;
}

.filters {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: bold;
  color: #333;
}

.filter-group select,
.price-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  width: 80px;
}

.apply-filters-btn,
.reset-filters-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.apply-filters-btn {
  background-color: #007bff;
  color: white;
}

.apply-filters-btn:hover {
  background-color: #0056b3;
}

.reset-filters-btn {
  background-color: #6c757d;
  color: white;
}

.reset-filters-btn:hover {
  background-color: #545b62;
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-section label {
  font-weight: bold;
  color: #333;
}

.sort-section select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

/* 分类下拉样式 */
.category-dropdown {
  position: relative;
  cursor: pointer;
}

.category-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-width: 120px;
}

.selected-category {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow-down {
  font-size: 12px;
  color: #666;
}

.category-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 600px;
  margin-top: 5px;
}

.category-dropdown-content {
  display: flex;
  padding: 15px;
  gap: 20px;
}

.category-level {
  flex: 1;
  min-width: 180px;
}

.category-level-title {
  font-weight: bold;
  color: #333;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.category-list {
  list-style: none;
  max-height: 300px;
  overflow-y: auto;
}

.category-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.category-item:hover,
.category-item.active {
  background-color: #007bff;
  color: white;
}

.products-main {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.products-content {
  flex: 1;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-products {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.no-products-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.no-products h3 {
  margin-bottom: 10px;
  color: #333;
}

.reset-search-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.reset-search-btn:hover {
  background-color: #0056b3;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.page-btn,
.page-number {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 40px;
}

.page-btn:hover:not(:disabled),
.page-number:hover {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.page-info {
  font-size: 14px;
  color: #666;
  text-align: center;
  flex-basis: 100%;
  margin-top: 10px;
}

@media (max-width: 992px) {
  .products-main {
    flex-direction: column;
  }

  .filter-sort-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    justify-content: center;
  }

  .category-dropdown-menu {
    width: 100%;
  }

  .category-dropdown-content {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .products-header {
    padding: 20px 0;
  }

  .header-content {
    padding: 0 15px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 15px;
  }

  .products-main {
    padding: 0 15px;
    gap: 15px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }

  .pagination {
    flex-direction: column;
    gap: 10px;
  }

  .page-numbers {
    display: flex;
    overflow-x: auto;
    padding: 5px 0;
  }
}

@media (max-width: 576px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    justify-content: space-between;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>

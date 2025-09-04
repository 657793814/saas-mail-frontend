<!-- src/views/CheckoutView.vue -->
<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <h1>结算</h1>

      <!-- 用户未登录提示 -->
      <div v-if="!isLoggedIn" class="login-prompt">
        <p>请先登录以继续结算</p>
        <button @click="goToLogin" class="login-btn">立即登录</button>
      </div>

      <div v-else-if="cartItems.length > 0" class="checkout-content">
        <div class="checkout-form">
          <div class="form-section">
            <h2>收货信息</h2>

            <!-- 地址选择 -->
            <div class="form-group">
              <label>收货地址</label>
              <div class="address-selector">
                <select v-model="selectedAddressId" @change="onAddressChange">
                  <option value="">新增地址</option>
                  <option
                      v-for="address in userAddresses"
                      :key="address.id"
                      :value="address.id"
                  >
                    {{ address.province }}{{ address.city }}{{ address.district }} {{ address.detailAddress }} ({{ address.receiverName }})
                  </option>
                </select>
                <button @click="openAddressDialog" class="add-address-btn">新增地址</button>
              </div>
            </div>

            <!-- 地址表单 -->
            <div class="address-form" v-if="!selectedAddressId || selectedAddressId === ''">
              <div class="form-row">
                <div class="form-group">
                  <label for="receiverName">收货人姓名</label>
                  <input
                      type="text"
                      id="receiverName"
                      v-model="formData.receiverName"
                      placeholder="请输入收货人姓名"
                  >
                </div>

                <div class="form-group">
                  <label for="receiverPhone">联系电话</label>
                  <input
                      type="tel"
                      id="receiverPhone"
                      v-model="formData.receiverPhone"
                      placeholder="请输入联系电话"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="province">省份</label>
                  <select
                      id="province"
                      v-model="formData.province"
                      @change="onProvinceChange"
                  >
                    <option value="">请选择省份</option>
                    <option
                        v-for="province in provinces"
                        :key="province.code"
                        :value="province.name"
                    >
                      {{ province.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="city">城市</label>
                  <select
                      id="city"
                      v-model="formData.city"
                      @change="onCityChange"
                      :disabled="!formData.province"
                  >
                    <option value="">请选择城市</option>
                    <option
                        v-for="city in cities"
                        :key="city.code"
                        :value="city.name"
                    >
                      {{ city.name }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="district">区县</label>
                  <select
                      id="district"
                      v-model="formData.district"
                      @change="onDistrictChange"
                      :disabled="!formData.city"
                  >
                    <option value="">请选择区县</option>
                    <option
                        v-for="district in districts"
                        :key="district.code"
                        :value="district.name"
                    >
                      {{ district.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label for="detailAddress">详细地址</label>
                <textarea
                    id="detailAddress"
                    v-model="formData.detailAddress"
                    placeholder="请输入详细地址"
                    rows="3"
                ></textarea>
              </div>
            </div>

            <!-- 已选择地址显示 -->
            <div class="selected-address" v-else>
              <div class="address-info">
                <p><strong>收货人：</strong>{{ selectedAddress.receiverName }}</p>
                <p><strong>电话：</strong>{{ selectedAddress.receiverPhone }}</p>
                <p><strong>地址：</strong>{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }} {{ selectedAddress.detailAddress }}</p>
              </div>
              <button @click="editAddress" class="edit-address-btn">修改地址</button>
            </div>
          </div>

          <div class="form-section">
            <h2>支付方式</h2>
            <div class="payment-options">
              <label class="payment-option">
                <input
                    type="radio"
                    v-model="formData.paymentMethod"
                    value="alipay"
                >
                <span>支付宝</span>
              </label>

              <label class="payment-option">
                <input
                    type="radio"
                    v-model="formData.paymentMethod"
                    value="wechat"
                >
                <span>微信支付</span>
              </label>

              <label class="payment-option">
                <input
                    type="radio"
                    v-model="formData.paymentMethod"
                    value="bank"
                >
                <span>银行卡支付</span>
              </label>
            </div>
          </div>
        </div>

        <div class="order-summary">
          <h2>订单信息</h2>
          <div class="order-items">
            <div
                v-for="item in cartItems"
                :key="item.skuId"
                class="order-item"
            >
              <div class="item-info">
                <span class="item-name">{{ item.title }}</span>
                <span class="item-specs">{{ getSpecsText(item.specifications) }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
              <div class="item-price">
                ¥{{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>

          <div class="order-total">
            <div class="total-row">
              <span>商品总价:</span>
              <span>¥{{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="total-row">
              <span>运费:</span>
              <span>¥{{ shippingFee.toFixed(2) }}</span>
            </div>
            <div class="total-row final-total">
              <span>应付总额:</span>
              <span>¥{{ (totalPrice + shippingFee).toFixed(2) }}</span>
            </div>
          </div>

          <button
              @click="submitOrder"
              :disabled="!isFormValid"
              class="submit-order-btn"
          >
            提交订单
          </button>
        </div>
      </div>

      <div v-else class="empty-cart">
        <p>购物车为空，无法结算</p>
        <router-link to="/products" class="continue-shopping">
          去购物
        </router-link>
      </div>
    </div>

    <!-- 订单确认弹窗 -->
    <div v-if="showConfirmDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>订单提交成功</h3>
        <p>您的订单已成功提交，订单号：{{ orderNumber }}</p>
        <p>请在支付页面完成付款。</p>
        <div class="dialog-actions">
          <button @click="goToOrderDetail" class="primary-btn">
            查看订单
          </button>
          <button @click="continueShopping" class="secondary-btn">
            继续购物
          </button>
        </div>
      </div>
    </div>

    <!-- 新增收货地址弹窗 -->
    <div v-if="showAddressDialog" class="dialog-overlay">
      <div class="dialog address-dialog">
        <h3>{{ isEditingAddress ? '编辑收货地址' : '新增收货地址' }}</h3>
        <div class="address-form-dialog">
          <div class="form-row">
            <div class="form-group">
              <label for="dialogReceiverName">收货人姓名 *</label>
              <input
                  type="text"
                  id="dialogReceiverName"
                  v-model="formData.receiverName"
                  placeholder="请输入收货人姓名"
              >
            </div>

            <div class="form-group">
              <label for="dialogReceiverPhone">联系电话 *</label>
              <input
                  type="tel"
                  id="dialogReceiverPhone"
                  v-model="formData.receiverPhone"
                  placeholder="请输入联系电话"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="dialogProvince">省份 *</label>
              <select
                  id="dialogProvince"
                  v-model="formData.province"
                  @change="onProvinceChange"
              >
                <option value="">请选择省份</option>
                <option
                    v-for="province in provinces"
                    :key="province.code"
                    :value="province.name"
                >
                  {{ province.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="dialogCity">城市 *</label>
              <select
                  id="dialogCity"
                  v-model="formData.city"
                  @change="onCityChange"
                  :disabled="!formData.province"
              >
                <option value="">请选择城市</option>
                <option
                    v-for="city in cities"
                    :key="city.code"
                    :value="city.name"
                >
                  {{ city.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="dialogDistrict">区县 *</label>
              <select
                  id="dialogDistrict"
                  v-model="formData.district"
                  @change="onDistrictChange"
                  :disabled="!formData.city"
              >
                <option value="">请选择区县</option>
                <option
                    v-for="district in districts"
                    :key="district.code"
                    :value="district.name"
                >
                  {{ district.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="dialogDetailAddress">详细地址 *</label>
            <textarea
                id="dialogDetailAddress"
                v-model="formData.detailAddress"
                placeholder="请输入详细地址"
                rows="3"
            ></textarea>
          </div>
        </div>

        <div class="dialog-actions">
          <button @click="closeAddressDialog" class="secondary-btn">
            取消
          </button>
          <button @click="saveAddress" class="primary-btn">
            保存地址
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiRequest from "@/utils/request";

export default {
  name: 'CheckoutView',
  data() {
    return {
      cart: [],
      isLoggedIn: false,
      userAddresses: [],
      selectedAddressId: '',
      selectedAddress: null,
      areaData: [],
      provinces: [],
      cities: [],
      districts: [],
      formData: {
        receiverName: '',
        receiverPhone: '',
        province: '',
        provinceId: 0,
        city: '',
        cityId: 0,
        district: '',
        districtId: 0,
        detailAddress: '',
        paymentMethod: 'alipay'
      },
      shippingFee: 0,
      showConfirmDialog: false,
      showAddressDialog: false,
      isEditingAddress: false,
      editingAddressId: null,
      orderNumber: ''
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
    },

    isFormValid() {
      if (this.selectedAddressId) {
        return true;
      }

      return (
          this.formData.receiverName.trim() !== '' &&
          this.formData.receiverPhone.trim() !== '' &&
          this.formData.province.trim() !== '' &&
          this.formData.provinceId !== 0 &&
          this.formData.city.trim() !== '' &&
          this.formData.cityId !== 0 &&
          this.formData.district.trim() !== '' &&
          this.formData.districtId !== 0 &&
          this.formData.detailAddress.trim() !== ''
      )
    }
  },

  methods: {
    getSpecsText(specifications) {
      if (!specifications || specifications.length === 0) return ''
      return specifications.map(spec => `${spec.specName}: ${spec.value}`).join(', ')
    },

    loadCartData() {
      try {
        const checkoutItems = sessionStorage.getItem('checkoutItems')
        if (checkoutItems) {
          this.cart = JSON.parse(checkoutItems)
          sessionStorage.removeItem('checkoutItems')
          return
        }

        const cartData = localStorage.getItem('shoppingCart')
        if (cartData) {
          this.cart = JSON.parse(cartData)
        }
      } catch (error) {
        console.error('加载购物车数据失败:', error)
        this.cart = []
      }
    },

    checkLoginStatus() {
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;

      if (this.isLoggedIn) {
        this.loadUserData();
      }
    },

    async loadUserData() {
      try {
        await this.loadUserAddresses();
        await this.loadAreaData();
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    },

    async loadUserAddresses() {
      try {
        const result = await apiRequest.get("/api/user/addresses");
        if (result.code === 0) {
          this.userAddresses = result.data;

          if (this.userAddresses.length > 0) {
            const defaultAddress = this.userAddresses.find(addr => addr.isDefault) || this.userAddresses[0];
            this.selectedAddressId = defaultAddress.id;
            this.selectedAddress = defaultAddress;
          } else {
            // 用户没有收货地址，显示创建地址弹窗
            this.showAddressDialog = true;
            this.isEditingAddress = false;
            this.editingAddressId = null;
            this.resetAddressForm();
          }
        }
      } catch (error) {
        console.error('加载用户地址失败:', error);
      }
    },

    // 加载所有地区数据并构建树结构
    async loadAreaData() {
      try {
        const result = await apiRequest.get("/api/area_data");
        if (result.code === 0) {
          this.areaData = result.data;

          // 构建省份列表 (level = 1)
          this.provinces = this.areaData.filter(item => item.level === 1);
        }
      } catch (error) {
        console.error('加载省市区数据失败:', error);
      }
    },

    // 省份变化时加载城市数据
    onProvinceChange() {
      // 重置城市和区县相关数据
      this.formData.city = '';
      this.formData.cityId = '';
      this.formData.district = '';
      this.formData.districtId = '';
      this.cities = [];
      this.districts = [];

      if (!this.formData.province) return;

      // 根据选中的省份名称找到对应的省份
      const selectedProvince = this.provinces.find(province => province.name === this.formData.province);
      if (!selectedProvince) return;

      // 保存省份id
      this.formData.provinceId = selectedProvince.id;

      // 根据省份code获取城市数据 (level = 2 且 parentCode = 省份code)
      this.cities = this.areaData.filter(item =>
          item.level === 2 && item.parentCode === selectedProvince.code
      );
    },

    // 城市变化时加载区县数据
    onCityChange() {
      // 重置区县相关数据
      this.formData.district = '';
      this.formData.districtId = '';
      this.districts = [];

      if (!this.formData.city) return;

      // 根据选中的城市名称找到对应的城市
      const selectedCity = this.cities.find(city => city.name === this.formData.city);
      if (!selectedCity) return;

      // 保存城市id
      this.formData.cityId = selectedCity.id;

      // 根据城市code获取区县数据 (level = 3 且 parentCode = 城市code)
      this.districts = this.areaData.filter(item =>
          item.level === 3 && item.parentCode === selectedCity.code
      );
    },

    // 区县变化时保存区县id
    onDistrictChange() {
      if (!this.formData.district) {
        this.formData.districtId = '';
        return;
      }

      // 根据选中的区县名称找到对应的区县
      const selectedDistrict = this.districts.find(district => district.name === this.formData.district);
      if (selectedDistrict) {
        // 保存区县id
        this.formData.districtId = selectedDistrict.id;
      }
    },

    onAddressChange() {
      if (this.selectedAddressId) {
        this.selectedAddress = this.userAddresses.find(addr => addr.id === this.selectedAddressId);
      } else {
        this.selectedAddress = null;
        this.formData.receiverName = '';
        this.formData.receiverPhone = '';
        this.formData.province = '';
        this.formData.provinceId = '';
        this.formData.city = '';
        this.formData.cityId = '';
        this.formData.district = '';
        this.formData.districtId = '';
        this.formData.detailAddress = '';
      }
    },

    editAddress() {
      this.selectedAddressId = '';
      this.selectedAddress = null;

      if (this.selectedAddress) {
        this.formData.receiverName = this.selectedAddress.receiverName;
        this.formData.receiverPhone = this.selectedAddress.receiverPhone;
        this.formData.province = this.selectedAddress.province;
        this.formData.provinceId = this.selectedAddress.provinceId || '';
        this.formData.city = this.selectedAddress.city;
        this.formData.cityId = this.selectedAddress.cityId || '';
        this.formData.district = this.selectedAddress.district;
        this.formData.districtId = this.selectedAddress.districtId || '';
        this.formData.detailAddress = this.selectedAddress.detailAddress;

        // 重新加载城市和区县数据以匹配选中的省份
        this.onProvinceChange();
        this.onCityChange();
      }
    },

    goToLogin() {
      localStorage.setItem('redirectAfterLogin', this.$route.fullPath);
      this.$router.push('/login');
    },

    openAddressDialog() {
      this.showAddressDialog = true;
      this.isEditingAddress = false;
      this.editingAddressId = null;
      this.resetAddressForm();
    },

    closeAddressDialog() {
      this.showAddressDialog = false;
      this.resetAddressForm();
    },

    resetAddressForm() {
      this.formData.receiverName = '';
      this.formData.receiverPhone = '';
      this.formData.province = '';
      this.formData.provinceId = '';
      this.formData.city = '';
      this.formData.cityId = '';
      this.formData.district = '';
      this.formData.districtId = '';
      this.formData.detailAddress = '';
      this.cities = [];
      this.districts = [];
    },

    async saveAddress() {
      // 验证表单
      if (!this.isFormValid) {
        alert('请填写完整的收货信息');
        return;
      }

      try {
        const addressData = {
          addressId:this.editingAddressId,
          receiverName: this.formData.receiverName,
          receiverPhone: this.formData.receiverPhone,
          province: this.formData.province,
          provinceId: this.formData.provinceId,
          city: this.formData.city,
          cityId: this.formData.cityId,
          district: this.formData.district,
          districtId: this.formData.districtId,
          detailAddress: this.formData.detailAddress,
          isDefault: this.userAddresses.length === 0
        };

        let result;
        if (this.isEditingAddress && this.editingAddressId) {
          // 更新地址
          result = await apiRequest.put(`/api/user/edit_address`, addressData);
        } else {
          // 创建新地址
          result = await apiRequest.post("/api/user/add_address", addressData);
        }

        if (result.code === 0) {
          this.closeAddressDialog();
          await this.loadUserAddresses();

          if (this.userAddresses.length === 0 && result.data) {
            this.selectedAddressId = result.data.id;
            this.selectedAddress = result.data;
          }

          alert(this.isEditingAddress ? '地址更新成功' : '地址创建成功');
        } else {
          alert('地址保存失败：' + result.msg);
        }
      } catch (error) {
        console.error('保存地址失败:', error);
        alert('地址保存失败，请重试');
      }
    },

    editExistingAddress(address) {
      this.showAddressDialog = true;
      this.isEditingAddress = true;
      this.editingAddressId = address.id;

      this.formData.receiverName = address.receiverName;
      this.formData.receiverPhone = address.receiverPhone;
      this.formData.province = address.province;
      this.formData.provinceId = address.provinceId || '';
      this.formData.city = address.city;
      this.formData.cityId = address.cityId || '';
      this.formData.district = address.district;
      this.formData.districtId = address.districtId || '';
      this.formData.detailAddress = address.detailAddress;

      this.onProvinceChange();
      this.onCityChange();
      // 需要触发区县change事件来设置districtId
      this.onDistrictChange();
    },

    async submitOrder() {
      if (!this.isFormValid) {
        alert('请填写完整的收货信息')
        return
      }

      try {
        const orderData = {
          items: this.cart.map(item => ({
            productId: item.productId,
            skuId: item.skuId,
            quantity: item.quantity,
            price: item.price
          })),
          receiverName: this.selectedAddressId ? this.selectedAddress.receiverName : this.formData.receiverName,
          receiverPhone: this.selectedAddressId ? this.selectedAddress.receiverPhone : this.formData.receiverPhone,
          province: this.selectedAddressId ? this.selectedAddress.province : this.formData.province,
          provinceId: this.selectedAddressId ? this.selectedAddress.provinceId : this.formData.provinceId,
          city: this.selectedAddressId ? this.selectedAddress.city : this.formData.city,
          cityId: this.selectedAddressId ? this.selectedAddress.cityId : this.formData.cityId,
          district: this.selectedAddressId ? this.selectedAddress.district : this.formData.district,
          districtId: this.selectedAddressId ? this.selectedAddress.districtId : this.formData.districtId,
          detailAddress: this.selectedAddressId ? this.selectedAddress.detailAddress : this.formData.detailAddress,
          paymentMethod: this.formData.paymentMethod,
          totalAmount: this.totalPrice + this.shippingFee
        };

        const result = await apiRequest.post("/api/orders", orderData);

        if (result.code === 0) {
          this.orderNumber = result.data.orderNumber;
          this.showConfirmDialog = true;

          localStorage.removeItem('shoppingCart');

          const event = new CustomEvent('cart-updated')
          document.dispatchEvent(event);
        } else {
          alert('订单提交失败：' + result.msg);
        }
      } catch (error) {
        console.error('提交订单失败:', error);
        alert('订单提交失败，请重试');
      }
    },

    goToOrderDetail() {
      this.showConfirmDialog = false
      this.$router.push('/orders/' + this.orderNumber)
    },

    continueShopping() {
      this.showConfirmDialog = false
      this.$router.push('/products')
    }
  },

  mounted() {
    this.loadCartData()
    this.checkLoginStatus()
  },

  watch: {
    '$route'() {
      this.checkLoginStatus();
    }
  }
}
</script>

<style scoped>
.checkout-page {
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-container h1 {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
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

.checkout-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.form-section {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.form-section h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-group {
  margin-bottom: 20px;
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.address-selector {
  display: flex;
  gap: 10px;
}

.address-selector select {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.add-address-btn {
  padding: 12px 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.add-address-btn:hover {
  background-color: #218838;
}

.selected-address {
  background-color: #e9ecef;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.address-info p {
  margin: 5px 0;
}

.edit-address-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-address-btn:hover {
  background-color: #0056b3;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.payment-option input {
  width: auto;
}

.order-summary {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  height: fit-content;
}

.order-summary h2 {
  margin-bottom: 20px;
  font-size: 20px;
  color: #333;
}

.order-items {
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
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

.order-total {
  border-top: 2px solid #ddd;
  padding-top: 15px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.final-total {
  font-size: 18px;
  font-weight: bold;
  color: #ff6700;
}

.submit-order-btn {
  width: 100%;
  padding: 15px;
  background-color: #ff6700;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s;
}

.submit-order-btn:hover:not(:disabled) {
  background-color: #e55d00;
}

.submit-order-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
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
}

.address-dialog {
  max-width: 600px;
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
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.secondary-btn {
  background-color: #6c757d;
  color: white;
}

.address-form-dialog .form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.address-form-dialog .form-group {
  flex: 1;
  margin-bottom: 0;
}

.address-form-dialog .form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.address-form-dialog .form-group input,
.address-form-dialog .form-group select,
.address-form-dialog .form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .address-selector {
    flex-direction: column;
  }

  .dialog {
    padding: 20px;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .address-form-dialog .form-row {
    flex-direction: column;
    gap: 10px;
  }
}
</style>

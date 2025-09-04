import { createStore } from 'vuex'
import { productApi, cartApi } from '@/utils/api'
import { getUserUUID } from '@/utils/uuid'

const userUUID = getUserUUID();

export default createStore({
    state: {
        userUUID: userUUID,
        cart: [],
        products: [],
        categories: [],
        userInfo: null
    },

    mutations: {
        SET_USER_UUID(state, uuid) {
            state.userUUID = uuid;
        },

        SET_CART(state, cart) {
            state.cart = cart
        },

        ADD_TO_CART(state, product) {
            const existingItem = state.cart.find(item => item.id === product.id)
            if (existingItem) {
                existingItem.quantity++
            } else {
                state.cart.push({ ...product, quantity: 1 })
            }
        },

        REMOVE_FROM_CART(state, productId) {
            state.cart = state.cart.filter(item => item.id !== productId)
        },

        UPDATE_CART_ITEM_QUANTITY(state, { productId, quantity }) {
            const item = state.cart.find(item => item.id === productId)
            if (item) {
                item.quantity = quantity
            }
        },

        CLEAR_CART(state) {
            state.cart = []
        },

        SET_PRODUCTS(state, products) {
            state.products = products
        },

        SET_CATEGORIES(state, categories) {
            state.categories = categories
        },

        SET_USER_INFO(state, userInfo) {
            state.userInfo = userInfo
        }
    },

    actions: {
        // 获取商品列表
        async fetchProducts({ commit }, params = {}) {
            try {
                const response = await productApi.getProducts(params)
                commit('SET_PRODUCTS', response.data)
                return response
            } catch (error) {
                console.error('获取商品列表失败1:', error)
                throw error
            }
        },

        // 添加到购物车
        addToCart({ commit }, product) {
            commit('ADD_TO_CART', product)
        },

        // 从购物车移除
        removeFromCart({ commit }, productId) {
            commit('REMOVE_FROM_CART', productId)
        },

        // 更新购物车商品数量
        updateCartItemQuantity({ commit }, { productId, quantity }) {
            commit('UPDATE_CART_ITEM_QUANTITY', { productId, quantity })
        },

        // 清空购物车
        clearCart({ commit }) {
            commit('CLEAR_CART')
        },

        // 获取购物车数据（如果后端支持）
        async fetchCart({ commit }) {
            try {
                const response = await cartApi.getCart()
                commit('SET_CART', response.data)
                return response
            } catch (error) {
                console.error('获取购物车数据失败:', error)
                throw error
            }
        }
    },

    getters: {
        cartTotal: (state) => {
            return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
        },

        cartItemCount: (state) => {
            return state.cart.reduce((count, item) => count + item.quantity, 0)
        },

        // 按分类筛选商品
        productsByCategory: (state) => (category) => {
            if (!category) return state.products
            return state.products.filter(product => product.category === category)
        }
    }
})

import request from '@/utils/request'

// 商品相关 API
export const productApi = {
    // 获取商品列表
    getProducts(params) {
        return request({
            url: '/products',
            method: 'get',
            params
        })
    },

    // 获取商品详情
    getProductDetail(id) {
        return request({
            url: `/products/${id}`,
            method: 'get'
        })
    },

    // 获取商品分类
    getCategories() {
        return request({
            url: '/categories',
            method: 'get'
        })
    }
}

// 购物车相关 API
export const cartApi = {
    // 获取购物车列表
    getCart() {
        return request({
            url: '/cart',
            method: 'get'
        })
    },

    // 添加商品到购物车
    addToCart(data) {
        return request({
            url: '/cart',
            method: 'post',
            data
        })
    },

    // 更新购物车商品数量
    updateCartItem(id, data) {
        return request({
            url: `/cart/${id}`,
            method: 'put',
            data
        })
    },

    // 删除购物车商品
    removeCartItem(id) {
        return request({
            url: `/cart/${id}`,
            method: 'delete'
        })
    },

    // 清空购物车
    clearCart() {
        return request({
            url: '/cart',
            method: 'delete'
        })
    }
}

// 订单相关 API
export const orderApi = {
    // 创建订单
    createOrder(data) {
        return request({
            url: '/orders',
            method: 'post',
            data
        })
    },

    // 获取订单列表
    getOrders(params) {
        return request({
            url: '/orders',
            method: 'get',
            params
        })
    },

    // 获取订单详情
    getOrderDetail(id) {
        return request({
            url: `/orders/${id}`,
            method: 'get'
        })
    }
}

// 用户相关 API
export const userApi = {
    // 用户登录
    login(data) {
        return request({
            url: '/auth/login',
            method: 'post',
            data
        })
    },

    // 用户注册
    register(data) {
        return request({
            url: '/auth/register',
            method: 'post',
            data
        })
    },

    // 获取用户信息
    getUserInfo() {
        return request({
            url: '/user/info',
            method: 'get'
        })
    }
}

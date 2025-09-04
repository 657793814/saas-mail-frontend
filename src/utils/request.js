// src/utils/request.js
import CryptoJS from 'crypto-js';

class ApiRequest {
    constructor() {
        // 从本地存储获取默认值
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    getAuthInfo() {
        return {
            token: localStorage.getItem('token'),
            rand_str: localStorage.getItem('randStr'),
        };
    }

    // 生成签名
    encryptSign(rand_str, timestamp, token) {
        return CryptoJS.MD5(rand_str + timestamp + token).toString();
    }

    // 生成时间戳
    getTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    getTodayDateString() {
        return new Date().toISOString().split('T')[0];
    }

    generateRandomString(length = 10) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // 检查是否需要跳转到登录页
    checkAuthError(responseData) {
        // 定义需要跳转到登录页的错误码
        const authErrorCodes = [200006]; // 根据你的实际错误码调整

        if (authErrorCodes.includes(responseData.code)) {

            // 跳转到登录页
            if (window && window.location) {
                window.location.href = '/login';
            } else if (this.router) {
                this.router.push('/login');
            }

            return true;
        }
        return false;
    }

    // 发送请求
    async request(url, options = {}) {
        const {method = 'GET', data = {}, headers = {}, needAuth = true} = options;
        // 合并默认头部
        const finalHeaders = {...this.defaultHeaders, ...headers};
        let finalUrl = url;
        let finalData = data;

        // 如果需要认证信息
        if (needAuth) {
            const {token, rand_str} = this.getAuthInfo();
            const timestamp = this.getTimestamp();
            const sign = this.encryptSign(rand_str, timestamp, token);

            //url 相关参数
            const params = new URLSearchParams({
                token,
                rand_str,
                sign,
                timestamp,
                ...data
            });
            finalUrl = `${url}?${params.toString()}`;
        }

        const config = {
            method,
            headers: finalHeaders
        };

        // 如果有请求体数据且不是GET请求
        if (method !== 'GET' && Object.keys(finalData).length > 0) {
            config.body = JSON.stringify(finalData);
        }

        try {
            const response = await fetch(finalUrl, config);
            const result = await response.json();

            // 检查是否需要跳转到登录页
            if (this.checkAuthError(result)) {
                console.error('Authentication required');
                throw new Error('Authentication required');
            }

            return result;
        } catch (error) {
            console.error('请求失败:', error);
            throw error;
        }
    }

    // GET请求
    async get(url, data = {}, headers = {}) {
        return this.request(url, {method: 'GET', data, headers});
    }

    // POST请求
    async post(url, data = {}, headers = {}) {
        return this.request(url, {method: 'POST', data, headers});
    }

    // PUT请求
    async put(url, data = {}, headers = {}) {
        return this.request(url, {method: 'PUT', data, headers});
    }

    // DELETE请求
    async delete(url, data = {}, headers = {}) {
        return this.request(url, {method: 'DELETE', data, headers});
    }
}

// 创建单例实例
const apiRequest = new ApiRequest();

export default apiRequest;

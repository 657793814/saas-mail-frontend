import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ProductView from '@/views/ProductView.vue'
import CartView from '@/views/CartView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import ProductDetailView from "@/views/ProductDetailView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView
    },
    {
        path: '/products',
        name: 'Products',
        component: ProductView
    },
    {
        path: '/cart',
        name: 'Cart',
        component: CartView
    },
    {
        path: '/checkout',
        name: 'Checkout',
        component: CheckoutView
    },
    {
        path: '/product/:id',
        name: 'product-detail',
        component: ProductDetailView,
        props: true
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
        props: true
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
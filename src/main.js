import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './assets/css/global.css'
// Tạo ứng dụng Vue và gắn router
createApp(App).use(router).mount('#app')

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
// 全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false

// 配置请求路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

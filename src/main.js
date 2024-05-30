import { createApp } from 'vue'
import { createPinia } from 'pinia'
import createRouter from './router'
import createApi from './plugins/useapi'

import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'

import App from './App.vue'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

const router = createRouter()
app.use(router)

const api = createApi({
  apiBaseUrl: import.meta.env.VITE_API_URL || '',
  router
})
app.use(api)

//pinia.use(api)

router.isReady().then(() => {
  app.mount('#app')
})

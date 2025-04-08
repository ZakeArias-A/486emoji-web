import { createApp } from 'vue'
import Vuesax from 'vuesax-alpha'

import App from './App.vue'

import 'vuesax-alpha/theme-chalk/index.css'
// dark mode
import 'vuesax-alpha/theme-chalk/dark/css-vars.css'

const app = createApp(App)

app.use(Vuesax)

app.mount('#app')

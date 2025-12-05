import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PrimeVue } from '@primevue/core'
import Aura from '@primeuix/themes/aura'
import { DialogService } from 'primevue'
import router from './router'
import App from './App.vue'

import './assets/styles/main.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})
app.use(DialogService)

app.mount('#app')

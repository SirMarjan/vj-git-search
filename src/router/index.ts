import { createRouter, createWebHistory } from 'vue-router'
import SearchFilter from '@/views/SearchFilter.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: SearchFilter,
    },
  ],
})

export default router

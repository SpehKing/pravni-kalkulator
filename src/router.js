import { createRouter, createWebHistory } from 'vue-router'
import CaseWizard from './pages/CaseWizard.vue'

const routerHistory = createWebHistory()

const router = createRouter({
  history: routerHistory,
  routes: [
    {
      path: '/',
      component: CaseWizard
    },
    {
      path: '/:pathMatch(.*)*',
      component: CaseWizard
    }
  ]
})

export default router

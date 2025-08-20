import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Timesheets from '../views/Timesheets.vue'
import EditTimesheet from '../views/EditTimesheet.vue'
import UploadExcel from '../views/UploadExcel.vue'
import Admin from '../views/Admin.vue'

const routes = [
  { path: '/', redirect: '/timesheets' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/timesheets', component: Timesheets },
  { path: '/timesheets/:id', component: EditTimesheet, props: true },
  { path: '/upload', component: UploadExcel },
  { path: '/admin', component: Admin }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// simple auth guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token && !['/login', '/register'].includes(to.path)) {
    return next('/login')
  }
  next()
})

export default router

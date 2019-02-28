import home from './components/main-page.vue';
import Login from './components/Login.vue';
import VueRouter from 'vue-router';
import AdminView from './components/admin-view.vue';

const routes = [
  { path: '*', component: home},
  { path: '/', component: home},
  { path: '/login', component: Login},
  { path: '/admin', component: AdminView, 
    meta: {
      requiresAuth: true,
    }
  },
]

const router = new VueRouter({
  routes
});

export default router;
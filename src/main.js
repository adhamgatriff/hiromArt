import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import firebase from 'firebase/app'
import 'firebase/auth'
import {VueMasonryPlugin} from 'vue-masonry';
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import config from './firebaseConfig';

Vue.config.productionTip = false
Vue.use(Vuetify)
Vue.use(VueMasonryPlugin)
Vue.use(VueRouter)

  router.beforeEach((to, from, next) => {
    const currentUser = firebase.auth().currentUser;
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    // firebase.auth().onAuthStateChanged((currentUser) => {
      if(requiresAuth && !currentUser) next('/login');
      if(currentUser && to.path === '/login') next('/admin');
      else if (!requiresAuth && currentUser) next('/');
      else next();
    // });
    

  });



  firebase.initializeApp(config);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

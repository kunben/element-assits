import Vue from 'vue'
import VueRouter from 'vue-router'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ElementAssits from '../src/index'
import App from './App.vue'

Vue.use(VueRouter)
Vue.use(Element, { size: 'small' })
// Vue.use(Element, { size: 'medium' })
Vue.use(ElementAssits)
Vue.config.productionTip = false

new Vue({
  el: '#app',
  render: h => h(App),
  router: new VueRouter({
    routes: [
      {
        path: '/',
        component: () => import('./index.vue')
      },
      {
        path: '/form',
        component: () => import('./form/index.vue')
      },
      {
        path: '/table',
        component: () => import('./table/index.vue')
      },
      {
        path: '/modal',
        component: () => import('./modal/index.vue')
      },
      {
        path: '/tree',
        component: () => import('./tree/index.vue')
      },
      {
        path: '/list',
        component: () => import('./list/index.vue')
      },
      {
        path: '/desc',
        component: () => import('./desc/index.vue')
      }
    ]
  })
})

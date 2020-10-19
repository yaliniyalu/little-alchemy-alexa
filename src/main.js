import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'

import './scss/style.scss'
import './js/font-awesome'

import VModal from 'vue-js-modal'
Vue.use(VModal, { dialog: true })

import vuescroll from 'vuescroll';
Vue.use(vuescroll)
Vue.component('vue-scroll', vuescroll);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

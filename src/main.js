import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'

import './scss/style.scss'
import './js/font-awesome'

import VModal from 'vue-js-modal'
Vue.use(VModal, { dialog: true })

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

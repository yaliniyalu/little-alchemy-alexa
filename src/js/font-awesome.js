import Vue from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faTimes, faQuestion, faRedoAlt, faChartLine } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faTimes, faQuestion, faRedoAlt, faChartLine)

Vue.component('font-awesome-icon', FontAwesomeIcon)
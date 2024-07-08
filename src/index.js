import isFunction from 'lodash/isFunction'
import EaSelect from './EaSelect'
import EaVirtualScroll from './EaSelect/VirtualScroll.vue'
import EaForm from './EaForm'
import EaTable from './EaTable'
import EaPopover from './EaPopover'
import EaModal from './EaModal'
import EaButton from './EaButton'
import EaSplit from './EaSplit'
import EaTree from './EaTree'
import EaList from './EaList'
import EaDesc from './EaDesc'
import EaScrollbar from './EaScrollbar'
import EaNumber from './EaNumber'
import EaRadio from './EaRadio'
import EaFileUpload from './EaFileUpload'

const install = Vue => {
  // 注册组件
  Vue.component('EaForm', EaForm)
  Vue.component('EaTable', EaTable)
  Vue.component('EaSelect', EaSelect)
  Vue.component('EaVirtualScroll', EaVirtualScroll)
  Vue.component('EaPopover', EaPopover)
  Vue.component('EaModal', EaModal)
  Vue.component('EaButton', EaButton)
  Vue.component('EaSplit', EaSplit)
  Vue.component('EaTree', EaTree)
  Vue.component('EaList', EaList)
  Vue.component('EaDesc', EaDesc)
  Vue.component('EaScrollbar', EaScrollbar)
  Vue.component('EaNumber', EaNumber)
  Vue.component('EaRadio', EaRadio)
  Vue.component('EaFileUpload', EaFileUpload)
  // 挂载异步加载组件的方法
  Vue.prototype.$asyncLoad = function asyncLoad (_importFunc, ...options) {
    const importFunc = (
      isFunction(_importFunc)
        ? _importFunc
        : () => Promise.resolve({ default: _importFunc })
    )
    importFunc().then(mod => {
        const TheClass = Vue.extend({
        name: 'AsyncContainer',
        parent: this,
        render (h) {
          return h(mod.default, ...options)
        }
      })
      const theIns = new TheClass()
      try {
        theIns.$on('hook:mounted', () => {
          const f = theIns.$children[0]
          const dialog = theIns.$children[0].$children[0]
          f.$on('closed', () => {
            document.body.removeChild(theIns.$el)
            theIns.$destroy()
          })
          dialog.$on('closed', () => {
            document.body.removeChild(theIns.$el)
            theIns.$destroy()
          })
        })
      } catch (err) {
        console.error(err)
      }
      // append
      theIns.$mount()
      document.body.appendChild(theIns.$el)
    })
  }
}

export default {
  install
}

export * from './util'

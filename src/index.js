import EaSelect from './EaSelect'
import EaVirtualScroll from './EaSelect/VirtualScroll.vue'
import EaForm from './EaForm'
import EaTable from './EaTable'
import EaDataTable from './EaDataTable'
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
import EaCheckbox from './EaCheckbox'
import EaFileUpload from './EaFileUpload'
import EaJsonSchema from './EaJsonSchema'
import EaDataTree from './EaDataTree'
import { uuid, recursive, recursiveFilter, asyncLoad, renderCell } from './util'
import { setBridge } from './bridge'

const install = (Vue, options) => {
  if (!options || (options.components !== false)) {
    // 注册组件
    Vue.component('EaForm', EaForm)
    Vue.component('EaTable', EaTable)
    Vue.component('EaDataTable', EaDataTable)
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
    Vue.component('EaCheckbox', EaCheckbox)
    Vue.component('EaFileUpload', EaFileUpload)
    Vue.component('EaJsonSchema', EaJsonSchema)
    Vue.component('EaDataTree', EaDataTree)
  }
  // 挂载原型方法
  Vue.prototype.$asyncLoad = asyncLoad
  // 共享 Vue
  setBridge(Vue)
}

export {
  EaSelect,
  EaVirtualScroll,
  EaForm,
  EaTable,
  EaDataTable,
  EaPopover,
  EaModal,
  EaButton,
  EaSplit,
  EaTree,
  EaList,
  EaDesc,
  EaScrollbar,
  EaNumber,
  EaRadio,
  EaCheckbox,
  EaFileUpload,
  EaJsonSchema,
  EaDataTree,
  uuid,
  recursive,
  recursiveFilter,
  asyncLoad,
  renderCell
}

export default install

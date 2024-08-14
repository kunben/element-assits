import { isFunction } from 'lodash-es'

// 随机 key
export const uuid = () => Math.random().toString()

// 递归
export const recursive = (data, callback, childrenProp = 'children', path = []) => {
  for (let i = 0; i < data.length; i ++) {
    if (callback && callback(data[i], path) === false) return false
    if (data[i][childrenProp] && data[i][childrenProp].length) {
      path.push(data[i])
      if (recursive(data[i][childrenProp], callback, childrenProp, path) === false) return false
    }
  }
  path.pop()
}

// 递归查找指定父组件
export const findParentComponent = (ins, pName) => {
  if (!ins || !pName) return void(0)
  if (ins.$parent.$options._componentTag === pName) return ins.$parent
  return findParentComponent(ins.$parent, pName)
}

// 异步载入组件
export async function asyncLoad (_importFunc, ...options) {
  const { default: Vue } = await import('vue')
  const { Message } = await import('element-ui')
  const importFunc = (
    isFunction(_importFunc)
    ? _importFunc
    : () => Promise.resolve({ default: _importFunc })
  )
  const msg = Message({
    message: '正在载入组件，请稍后...',
    iconClass: 'el-icon-loading',
    customClass: 'async-load-component',
    type: 'info',
    duration: 0
  })
  const { default: asyncComponent } = await importFunc().catch(() => {
    msg.type = 'error'
    msg.message = '组件载入失败'
    msg.showClose = true
    msg.iconClass = undefined
    setTimeout(msg.close, 3000)
  })
  const checkStyle = () => {
    const hsId = '__async-load-component-css'
    const hs = document.getElementById(hsId)
    if (hs) return void(0)
    const css = document.createElement('style')
    css.id = hsId
    css.innerHTML = `
      .async-load-component { min-width: 212px; }
      .async-load-component.el-message-fade-leave-active { transition: none !important; }
      .async-load-component .el-message__content { margin-left: 8px; color: #666; }
    `
    document.head.appendChild(css)
  }
  const TheClass = Vue.extend({
    name: 'AsyncContainer',
    mounted () {
      const end = () => {
        document.body.removeChild(this.$el)
        this.$destroy()
      }
      // 异步容器层
      this.$on('closed', end)
      this.$children.forEach(item => {
        // 可能的封装层
        item.$on('closed', end)
        item.$children.forEach(m => {
          // 可能的实际el-dialog组件层
          m.$on('closed', end)
        })
      })
    },
    render (h) {
      return h(asyncComponent, ...options)
    }
  })
  const TheIns = new TheClass()
  checkStyle()
  msg.close()
  TheIns.$mount()
  document.body.appendChild(TheIns.$el)
}

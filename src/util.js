import isFunction from 'lodash/isFunction'
import isPlainObject from 'lodash/isPlainObject'

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
    dangerouslyUseHTMLString: true,
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
  msg.close()
  const TheClass = Vue.extend({
    name: 'AsyncContainer',
    render (h) {
      const that = this
      if (!isPlainObject(options[0])) {
        options.unshift({})
      }
      options[0].on = {
        ...options[0].on,
        closed () {
          const _closed = options[0].on && options[0].on.closed
          isFunction(_closed) && _closed()
          document.body.removeChild(that.$el)
          that.$destroy()
        }
      }
      return h(asyncComponent, ...options)
    }
  })
  const TheIns = new TheClass()
  TheIns.$mount()
  document.body.appendChild(TheIns.$el)
}

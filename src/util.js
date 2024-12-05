import { isArray, isFunction, isBoolean, isPlainObject, omit } from 'lodash-es'
import { getBridge } from './bridge'
import { Message } from 'element-ui'
import SpareVue from 'vue'

// 随机 key
export const uuid = (max = 16) => {
  let num, str = ''
  const arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  for (let i = 0; i < max; i++) {
    num = Math.round(Math.random() * (arr.length - 1))
    str += arr[num]
  }
  return str
}

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

export const recursiveFilter = (data, callback, childrenProp = 'children') => {
  const result = [{ [childrenProp]: data, __root: true }]
  recursive(result, (item, path) => {
    if (item.__root) return void(0)
    if (callback(item)) {
      [...path, item].forEach(m => m.__show = true)
    }
  }, childrenProp)
  recursive(result, (item) => {
    if (!isArray(item[childrenProp])) return void(0)
    item[childrenProp] = item[childrenProp].filter(m => m.__show)
    item[childrenProp].forEach(m => delete m.__show)
  }, childrenProp)
  return result[0][childrenProp]
}

// 递归查找指定父元素
export const findParentDom = (dom, cn) => {
  if (!dom || !cn) return void(0)
  const dcn = dom.className || ''
  if (dcn.split(' ').includes(cn)) return dom
  return findParentDom(dom?.parentElement, cn)
}

// 递归查找指定父组件
export const findParentComponent = (ins, pName) => {
  if (!ins || !pName) return void(0)
  if (ins.$parent.$options._componentTag === pName) return ins.$parent
  return findParentComponent(ins.$parent, pName)
}

// 异步载入组件
export async function asyncLoad (_importFunc, ...options) {
  const importFunc = (
    isFunction(_importFunc)
    ? _importFunc
    : () => Promise.resolve({ default: _importFunc })
  )
  // hash
  asyncLoad.prevHashes = asyncLoad.prevHashes || []
  const theHash = Function.prototype.toString.call(importFunc)
  if (asyncLoad.prevHashes.includes(theHash)) {
    return void(0)
  }
  asyncLoad.prevHashes.push(theHash)
  // dependence
  const Vue = getBridge() || SpareVue
  // before load
  const msg = Message({
    message: '正在载入组件，请稍后...',
    iconClass: 'el-icon-loading',
    customClass: 'async-load-component',
    type: 'info',
    duration: 0
  })
  // async load
  const { default: asyncComponent } = await importFunc().catch(() => {
    msg.type = 'error'
    msg.message = '组件载入失败'
    msg.showClose = true
    msg.iconClass = undefined
    setTimeout(msg.close, 3000)
  }).finally(() => {
    asyncLoad.prevHashes = asyncLoad.prevHashes.filter(m => m !== theHash)
  })
  // style
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
  // create component
  const TheClass = Vue.extend({
    name: 'AsyncContainer',
    parent: this instanceof Vue ? this : undefined, // bind context. if it exists
    mounted () {
      const end = () => {
        document.body.removeChild(this.$el)
        this.$destroy()
      }
      // async container
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
  // mount component
  TheIns.$mount()
  document.body.appendChild(TheIns.$el)
}

// 渲染单元格（需要与EaTable搭配使用）
// promise 可以是【数组】或【resolve数组的promise对象】或【返回\1的函数】或【返回\2的函数】
// props label/value 配置项
// callback 回调函数，返回要渲染的内容
//   h 渲染方法
//   info 解析对象
//   info.value 原值
//   info.label 列表中value对应的label, 可能为空
//   info.item 列表中value对应的项, 可能为空
export function renderCell (promise, props, callback) {
  if (isArray(promise)) promise = Promise.resolve(promise)
  if (isFunction(promise)) promise = promise()
  if (isArray(promise)) promise = Promise.resolve(promise)
  if (!isPromise(promise)) promise = Promise.resolve([])

  const defaultProps = {
    label: 'label',
    value: 'value',
    style: 'style',
    tag: false
  }
  if (isFunction(props)) {
    callback = props
    props = defaultProps
  } else if (isBoolean(props)) {
    props = { ...defaultProps, tag: props }
  } else if (isPlainObject(props)) {
    props = { ...defaultProps, ...props }
  } else {
    props = defaultProps
  }

  return (h, { row, column, value, that, hideRefresh }) => {
    if (!column.__mapping && !column.__fetch) {
      column.__fetch = promise.then(list => {
        const __mapping = {}
        recursive(list, (item, path) => {
          __mapping[item[props.value]] = { ...item, __path: [...path, item] }
        })
        that.$set(column, '__mapping', __mapping)
        hideRefresh && hideRefresh()
      })
    } else if (column.__mapping) {
      const __item = column.__mapping[value]
      const __label = __item && __item[props.label]
      if (callback) return callback(h, {
        row, column, value, that, hideRefresh,
        label: __label,
        item: __item
      })
      else if (props.tag && __label) {
        return h('el-tag', {
          style: __item[props.style],
          props: {
            disableTransitions: true,
            ...omit(__item, [props.label, props.value, props.style])
          }
        }, __label)
      }
      return h('span', __label || value)
    }
    if (callback) return callback(h, { value })
    return h('span', value)
  }
}

function isPromise (o) {
  return Object.prototype.toString.call(o) === '[object Promise]'
}

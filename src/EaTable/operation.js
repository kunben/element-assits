// 根据插槽决定是否显示操作栏，以及如何显示

import { get, omit, isPlainObject } from 'lodash-es'

export function innerToThe (inner) {
  let show, attrs
  if (!isPlainObject(inner)) {
    show = Boolean(inner)
  } else {
    show = inner.show !== false,
    attrs = omit(inner, 'show')
  }
  return { show, attrs }
}

export class AutoFitOpt {
  constructor (list, callback) {
    this.o = new Array(list.length).fill(0)
    this.isTrigger = false
    this.callback = callback
  }
  add ({ $index }, nodes) {
    if (this.isTrigger) return void(0)
    this.o[$index] = nodes.map(m => {
      const text = get(m, 'componentInstance.$el.innerText')
      return Math.max(text && text.length, 2) * 14 + 14 + 9
    }).reduce((acc, m) => acc + m, 0) + 14*3 + 20
    if (this.o.every(Boolean)) {
      this.isTrigger = true
      this.callback(Math.max(...this.o))
    }
  }
}

// 检查操作栏（maxNumOfBtn，按钮最大数量，小于等于0，不限制）
export function checkOperation (maxNumOfBtn = 3) {
  const that = this
  let showAction, collapseBtnRender
  try {
    const nodes = flatSlots.bind(this)({ row: {}, column: {} })
    showAction = nodes.some(m => m.tag)
    // 有关按钮限制
    // 1. 如果不能大于0，则返回空渲染函数，将会使用插槽，渲染全部按钮
    if (!(maxNumOfBtn > 0)) throw new Error()
    if (maxNumOfBtn === nodes.length) throw new Error()
    // 2. 大于 0 时，限制按钮数量
    collapseBtnRender = {
      props: { scope: { type: Object, default: undefined } },
      data () {
        const usedNodes = flatSlots.bind(that)(this.scope).filter(m => m.tag)
        const children = usedNodes.slice(0, maxNumOfBtn - 1)
        const moreChildren = usedNodes.slice(maxNumOfBtn - 1)
        return {
          children,
          moreChildren
        }
      },
      mounted () {
        that.fitOpt?.add(this.scope, this.children)
      },
      render (h) {
        return h('div', [
          ...this.children,
          this.moreChildren.length && h('el-button', {
            class: 'more-btn',
            props: {
              type: 'text',
              icon: 'el-icon-more'
            },
            nativeOn: {
              click: evt => evt.stopPropagation(),
              mouseenter: evt => handlePopover.bind(this)(evt, h, this.moreChildren),
              mouseleave: () => handlePopoverClose()
            }
          }, '更多')
        ].filter(Boolean))
      }
    }
  } catch (err) {
    showAction = true
  }
  return {
    showAction,
    collapseBtnRender
  }
}

function flatSlots (scope) {
  // vue 2.6 开始，$scopedSlots API 有变化
  // https://v2.cn.vuejs.org/v2/api/#vm-scopedSlots
  const version = this.$root.constructor.version
  const v2 = (version.match(/\.(\d+)\./) || [])[1]
  let a = this.$slots['row-menu']
  let b = this.$scopedSlots['row-menu']
  a = Array.isArray(a) ? a : (a && a()) || []
  b = Array.isArray(b) ? b : (b && b(scope)) || []
  return v2 >= 6 ? b : [...a, ...b]
}

let popClose = undefined
let timer = null
let timer2 = null

function handlePopoverClose () {
  timer = setTimeout(() => {
    popClose && popClose()
  }, 200)
}

function handlePopover (evt, h, nodes) {
  clearTimeout(timer2)
  timer2 = setTimeout(() => {
    this.$asyncLoad(() => import('../EaPopover'), {
      class: 'ea-select-container',
      attrs: {
        popperClass: 'ea-popover-no-padding dense',
        placement: 'bottom',
        transition: 'ea-zoom-in-top'
      },
      props: {
        reference: evt.target,
        offset: -20,
        async mountedCallback (that) {
          await that.$nextTick()
          const el = that.$refs.pop.popperElm
          el.addEventListener('mouseenter', () => clearTimeout(timer))
          el.addEventListener('mouseleave', handlePopoverClose)
        }
      },
      scopedSlots: {
        default: ({ close }) => {
          popClose = close
          return h('div', {
            class: 'more-btn-panel'
          }, nodes.map(m => h('div', {
            class: 'more-btn-panel__item'
          }, [m])))
        }
      }
    })
  }, 200)
}

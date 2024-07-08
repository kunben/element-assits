import SelectPanel from './SelectPanel'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'

export const columnMenu = [
  { label: '隐藏此列', value: 1, icon: 'el-icon-remove-outline' },
  {
    label: '固定此列',
    value: 2,
    icon: 'el-icon-paperclip',
    children: [
      { label: '取消固定', value: 21, icon: 'el-icon-refresh-left' },
      { label: '固定到左侧', value: 22, icon: 'el-icon-back' },
      { label: '固定到右侧', value: 23, icon: 'el-icon-right' }
    ]
  },
  { label: '选择列', value: 3, icon: 'el-icon-tickets' },
  { label: '重置全部列', value: 4, icon: 'el-icon-refresh-left' }
]

export function middleRender (userRender) {
  const _render = (h, colAttrs) => {
    return h('span', {
      key: colAttrs.column.id,
      class: 'theader-th-cell'
    }, [
      userRender ? userRender(h, colAttrs) : h('span', get(colAttrs, 'column.label')),
      (colAttrs.column.fixed !== false) && h('i', { class: 'el-icon-paperclip', style: 'margin-left:4px' }),
      h('i', {
        class: 'el-icon-more cell-icon-menu',
        on: {
          click: evt => {
            evt.stopPropagation()
            this.$asyncLoad('EaPopover', {
              attrs: { popperClass: 'ea-popover-no-padding', placement: 'bottom-start' },
              props: { reference: evt.target, offset: -20 },
              scopedSlots: {
                default: ({ refresh, close }) => {
                  return  h(SelectPanel, {
                    props: { options: this.columnMenu },
                    on: {
                      open: refresh,
                      select: (item) => {
                        this.handleTriggerMenu(item, colAttrs.column.property)
                        if (isEmpty(item.children)) close()
                      }
                    }
                  })
                }
              }
            })
          }
        }
      })
    ])
  }
  return _render
}

<template>
<span
  :title="value"
  :class="{
    'cell-select': 1,
    'is-disabled': !allowEdit,
    'ea-success': ['string', 'number'].includes(row.type),
    'ea-blue': ['object', 'array'].includes(row.type),
    'ea-purple': ['boolean', 'integer'].includes(row.type)
  }"
  @click="handleClick">
  {{ value }}
</span>
</template>

<script>
import SelectPanel from '../EaTable/SelectPanel'
export default {
  inheritAttrs: false,
  props: {
    value: { type: String, default: undefined },
    row: { type: Object, default: undefined },
    data: { type: Array, default: () => [] },
    allowEdit: { type: Boolean, default: true }
  },
  methods: {
    async handleClick (evt) {
      if (!this.allowEdit) return void(0)
      evt.stopPropagation()
      this.$asyncLoad(() => import('../EaPopover'), {
        attrs: { popperClass: 'ea-popover-no-padding', placement: 'right' },
        props: { reference: evt.target, offset: -20 },
        scopedSlots: {
          default: ({ refresh, close }) => {
            return this.$createElement(SelectPanel, {
              props: { options: this.data, notActive: true, size: 'medium' },
              on: {
                open: refresh,
                select: (item) => {
                  this.$emit('input', item.value)
                  close()
                }
              }
            })
          }
        }
      })
    }
  }
}
</script>

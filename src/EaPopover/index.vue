<template>
<el-popover
  ref="pop"
  v-model="visible"
  :offset="offset"
  trigger="manual"
  v-bind="$attrs">
  <template #default>
    <slot :refresh="() => $refs.pop.updatePopper()" :close="() => visible = false" />
  </template>
</el-popover>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    reference: {
      type: HTMLElement,
      default: undefined
    },
    offset: {
      type: Number,
      default: 0
    }
  },
  data () {
    const listenClick = () => {
      this.visible = false
      this.$emit('closed')
      document.removeEventListener('click', listenClick)
    }
    this.$on('hook:mounted', () => {
      document.body.click()
      this.$refs.pop.referenceElm = this.reference
      this.visible = true
      document.addEventListener('click', listenClick)
    })
    return {
      visible: false
    }
  }
}
</script>

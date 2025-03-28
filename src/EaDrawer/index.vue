<template>
<el-drawer
  v-bind="{appendToBody: true, size: width, ...$attrs}"
  :custom-class="_customClass"
  v-on="$listeners"
  @closed="handleClosed">
  <template #title>
    <slot name="title" />
  </template>
  <div class="ea-drawer__content" :style="{padding: bodyPadding}">
    <slot />
  </div>
  <div v-if="_showFooter" class="ea-drawer__footer" :style="{height: footerHeight}">
    <el-button
      v-if="$listeners.confirm"
      type="primary"
      :icon="$listeners.cancel ? 'el-icon-circle-check' : ''"
      :class="$listeners.cancel ? '' : 'single-btn'"
      :loading="confirmLoading"
      @click="$emit('confirm')">{{ confirmText }}</el-button>
    <el-button
      v-if="$listeners.cancel"
      type="default"
      icon="el-icon-circle-close"
      :disabled="confirmLoading"
      @click="$emit('cancel')">{{ cancelText }}</el-button>
  </div>
  <div v-else-if="$slots.footer" class="ea-drawer__footer" :style="{height: footerHeight}">
    <slot name="footer" />
  </div>
</el-drawer>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    customClass: { type: String, default: undefined },
    confirmLoading: { type: Boolean, default: false },
    width: { type: String, default: '720px' },
    bodyPadding: { type: String, default: '20px' },
    headerHeight: { type: String, default: '70px' },
    footerHeight: { type: String, default: '70px' },
    confirmText: { type: String, default: '确定' },
    cancelText: { type: String, default: '取消' }
  },
  computed: {
    _customClass () {
      const ps = this.customClass ? (' ' + this.customClass) : ''
      return 'ea-drawer' + ps
    },
    _showFooter () {
      return this.$listeners.confirm || this.$listeners.cancel
    }
  },
  mounted () {
    document.activeElement && document.activeElement.blur()
    setTimeout(() => {
      const headDom = document.querySelector('.el-drawer__header')
      const bodyDom = document.querySelector('.el-drawer__body')
      if (headDom && this.headerHeight) headDom.style.height = this.headerHeight
      if (bodyDom) {
        bodyDom.style.height = `calc(100% - ${this.headerHeight})`
        bodyDom.style.position = 'relative'
        bodyDom.style.paddingBottom = (
          (this._showFooter || this.$slots.footer)
            ? this.footerHeight
            : 0
        )
      }
    })
  },
  methods: {
    handleClosed () {
      this.$parent && this.$parent.$emit('closed')
    }
  }
}
</script>

<style lang="scss">
.el-drawer.ea-drawer {
  .el-drawer__header {
    flex-shrink: 0;
    color: #555;
    font-size: 18px;
    border-bottom: 1px solid #DDD;
    margin-bottom: 0;
    padding: 0 20px;
    display: flex;
    align-items: center;
    .el-drawer__title {
      color: inherit;
      font-size: inherit;
    }
  }
  .ea-drawer__content {
    box-sizing: border-box;
    height: 100%;
    overflow: auto;
  }
  .ea-drawer__footer {
    border-top: 1px solid #DDD;
    background-color: #FFF;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>

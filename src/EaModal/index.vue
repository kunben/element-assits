<template>
<el-dialog
  v-bind="{closeOnClickModal: false, appendToBody: true, ...$attrs}"
  :custom-class="_customClass"
  :top="top"
  :fullscreen="fullscreen"
  v-on="$listeners"
  @opened="handleOpened"
  @closed="handleClosed">
  <!-- 传递closed事件的原因：asyncLoad父级并非使用$listeners来监听 -->
  <template v-if="$listeners.confirm || $listeners.cancel" #footer>
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
      @click="$emit('cancel')">{{ cancelText }}</el-button>
  </template>
  <template v-for="(value, name) in $scopedSlots" #[name]="data">
    <slot :name="name" v-bind="data" />
  </template>
  <template v-for="(value, name) in $slots" #[name]>
    <slot :name="name" />
  </template>
</el-dialog>
</template>

<script>
import { addDragPosition, addDragSize } from './drag'
export default {
  inheritAttrs: false,
  props: {
    customClass: { type: String, default: undefined },
    confirmLoading: { type: Boolean, default: false },
    margin: { type: String, default: '15vh auto' },
    top: { type: String, default: '15vh' },
    fullscreen: { type: Boolean, default: false },
    bodyPadding: { type: String, default: undefined },
    bodyMinHeight: { type: String, default: undefined },
    allowDrag: { type: Boolean, default: true },
    confirmText: { type: String, default: '确定' },
    cancelText: { type: String, default: '取消' }
  },
  data () {
    return {
      noMargin: false
    }
  },
  computed: {
    _customClass () {
      const ps = this.customClass ? (' ' + this.customClass) : ''
      const cs = this.noMargin ? ' no-margin' : ''
      return 'ea-modal' + ps + cs
    }
  },
  mounted () {
    document.activeElement && document.activeElement.blur()
    setTimeout(() => {
      const dgDom = this.$el.querySelector('.el-dialog')
      const dbDom = this.$el.querySelector('.el-dialog__body')
      if (dgDom && !this.fullscreen && this.margin) dgDom.style.margin = this.margin
      if (dgDom && !this.fullscreen && this.top) {
        dgDom.style.marginTop = this.top
        dgDom.style.marginBottom = this.top
      }
      if (dbDom && this.bodyPadding) dbDom.style.padding = this.bodyPadding
      if (dbDom && this.bodyMinHeight) dbDom.style.minHeight = this.bodyMinHeight
    }, 0)
  },
  methods: {
    handleOpened () {
      if (!this.allowDrag) return void(0)
      const destroyDP = addDragPosition(this.$el)
      const destroyDS = addDragSize(this.$el)
      this.noMargin = true
      this.$on('hook:destroyed', () => {
        destroyDP()
        destroyDS()
      })
    },
    handleClosed () {
      this.$parent && this.$parent.$emit('closed')
    }
  }
}
</script>

<style lang="scss">
.el-dialog.ea-modal {
  &.no-margin {
    margin: 0 !important;
  }
  &.is-fullscreen {
    border-radius: 0;
    margin: 0;
  }
  .el-dialog__header {
    color: #555;
    font-size: 18px;
    .el-dialog__title {
      color: inherit;
      font-size: inherit;
    }
  }
}
</style>

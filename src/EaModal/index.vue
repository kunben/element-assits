<template>
<el-dialog
  v-bind="{closeOnClickModal: false, appendToBody: true, ...$attrs}"
  :custom-class="_customClass"
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
      @click="$emit('confirm')">确定</el-button>
    <el-button
      v-if="$listeners.cancel"
      type="default"
      icon="el-icon-circle-close"
      @click="$emit('cancel')">取消</el-button>
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
    margin: { type: String, default: undefined },
    bodyPadding: { type: String, default: undefined },
    bodyMinHeight: { type: String, default: undefined },
    allowDrag: { type: Boolean, default: true }
  },
  data () {
    return {
      isClosing: false
    }
  },
  computed: {
    _customClass () {
      const ps = this.customClass ? (' ' + this.customClass) : ''
      const cs = this.isClosing ? ' is-closing' : ''
      return 'ea-modal' + ps + cs
    }
  },
  mounted () {
    document.activeElement && document.activeElement.blur()
    setTimeout(() => {
      const dgDom = this.$el.querySelector('.el-dialog')
      const dbDom = this.$el.querySelector('.el-dialog__body')
      if (dgDom && this.margin) dgDom.style.margin = this.margin
      if (dbDom && this.bodyPadding) dbDom.style.padding = this.bodyPadding
      if (dbDom && this.bodyMinHeight) dbDom.style.minHeight = this.bodyMinHeight
    }, 0)
  },
  methods: {
    handleOpened () {
      this.$emit('opened')
      if (!this.allowDrag) return void(0)
      this.isClosing = true
      const destroyDP = addDragPosition(this.$el)
      const destroyDS = addDragSize(this.$el)
      this.$on('hook:destroyed', () => {
        destroyDP()
        destroyDS()
      })
    },
    handleClosed () {
      this.$emit('closed')
      this.$parent && this.$parent.$emit('closed')
    }
  }
}
</script>

<style lang="scss">
.el-dialog.ea-modal {
  &.is-closing {
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
.async-load-component {
  min-width: 212px;
  &.el-message-fade-leave-active {
    transition: none !important;
  }
  .el-message__content {
    margin-left: 8px;
    color: #666;
  }
}
</style>

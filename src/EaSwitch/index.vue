<template>
<el-switch
  :value="value"
  v-bind="$attrs"
  :class="{['ea-switch-' + size]: 1}"
  @input="$emit('input', $event)"
  v-on="$listeners" />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: undefined,
    size: { type: String, default: 'small' }
  }
}
</script>

<style lang="scss">
.ea-switch-mini {
  .el-switch__core {
    width: 30px !important;
    height: 16px;
    &::after {
      width: 12px;
      height: 12px;
      left: 2px;
    }
  }
  &.is-checked .el-switch__core::after {
    margin-left: -13px;
  }
}
</style>

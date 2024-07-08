<template>
<el-input-number
  controls-position="right"
  class="ea-number"
  v-bind="$attrs"
  v-on="$listeners" />
</template>

<script>
export default {
  inheritAttrs: false
}
</script>

<style lang="scss">
.ea-number .el-input__inner {
  text-align: left;
}
</style>

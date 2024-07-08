<template>
<el-form-item
  :label="column.__label"
  :prop="column.prop"
  :rules="column.__rules"
  :style="column.style"
  :class="{'hidden-label': top.labelWidth === '0'}">
  <component
    :is="column.__component"
    v-model="top.model[column.prop]"
    :placeholder="column.__label"
    v-bind="column.__bind"
    v-on="column.__on"
    @keyup.native.enter="top.$emit('enter')" />
</el-form-item>
</template>

<script>
export default {
  inject: {
    top: {
      type: Object,
      required: true
    }
  },
  props: {
    column: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss">
.ea-form .el-form-item__content {
  & > .el-input-number,
  & > .el-input,
  & > .ea-select,
  & > .el-select {
    width: 100%;
  }
}
.ea-form .el-form-item.hidden-label {
  > .el-form-item__label {
    display: none;
  }
  > .el-form-item__content {
    width: 100%;
  }
}
</style>

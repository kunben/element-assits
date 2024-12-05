<template>
<el-form-item
  ref="ElFormItem"
  :label="column.__label"
  :prop="column.prop"
  :rules="column.__rules"
  :style="column.style"
  :class="{'hidden-label': top.labelWidth === '0'}">
  <template #label><!-- 裁剪空格
     -->{{ column.__label }}
    <el-tooltip
      v-if="column.__labelTooltip"
      v-bind="tooltip(column.__labelTooltip)">
      <i class="el-icon-warning-outline" />
    </el-tooltip>
  </template>
  <component
    :is="column.__component"
    v-model="top.model[column.prop]"
    v-bind="column.__bind"
    v-on="column.__on"
    @input="top.$emit('change', top.model)"
    @change="$refs.ElFormItem.$emit('el.form.change');"
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
  },
  methods: {
    tooltip (content) {
      return typeof content === 'string' ? { content } : content
    }
  }
}
</script>

<style lang="scss">
.ea-form .el-form-item__content {
  & > .el-input-number,
  & > .el-input,
  & > .ea-select,
  & > .el-date-editor,
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

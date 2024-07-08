<template>
<span v-if="inline">
  <template v-for="m in column">
    <FormItem :key="m.key" :column="m" />
  </template>
</span>
<div v-else>
  <div v-if="title" class="form-group-title">
    <span>{{ title }}</span>
  </div>
  <el-row v-if="column && column.length" :gutter="18">
    <el-col
      v-for="(m, i) in column"
      :key="i"
      :md="m.children ? 24 : (m.span || 12)"
      :pull="m.pull"
      :push="m.push"
      :offset="m.offset"
      :style="{marginBottom: (dense ? 0 : 9) + 'px'}">
      <template v-if="m.children && m.children.length">
        <LayoutContainer :column="m.children" :title="m.title" />
      </template>
      <FormItem v-else :column="m" />
    </el-col>
  </el-row>
</div>
</template>

<script>
import FormItem from './FormItem.vue'
export default {
  name: 'LayoutContainer',
  components: { FormItem },
  props: {
    title: {
      type: String,
      default: undefined
    },
    column: {
      type: Array,
      default: undefined
    },
    inline: {
      type: Boolean,
      default: false
    },
    dense: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="scss">
.ea-form.form-group-title {
  position: relative;
  height: 32px;
  margin-bottom: 22px;
  > span {
    position: absolute;
    top: 0;
    left: 20%;
    padding: 5px 25px;
    background-color: #fff;
    z-index: 1;
    color: $--color-secondary-text;
  }
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 0;
    border-bottom: 1px dashed $--color-border-base;
  }
}
</style>

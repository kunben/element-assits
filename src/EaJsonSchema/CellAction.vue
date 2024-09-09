<template>
<div class="cell-action">
  <i
    class="icon-btn eafont ea-icon-conf"
    :class="{'has': isNotEmpty}"
    @click="handleCommand('conf', $event)" />
  <template v-if="row.__state.isRoot">
    <i
      v-if="row.type === 'object'"
      class="icon-btn ea-success el-icon-circle-plus-outline"
      title="添加子节点"
      @click="handleCommand('sub')" />
  </template>
  <template v-else-if="row.__state.virtualArrayItems">
    <i
      v-if="row.type === 'object'"
      class="icon-btn ea-success el-icon-circle-plus-outline"
      title="添加子节点"
      @click="handleCommand('sub')" />
  </template>
  <template v-else>
    <el-dropdown v-if="row.type === 'object'" @command="handleCommand">
      <i class="icon-btn eafont ea-icon-more" />
      <el-dropdown-menu slot="dropdown" class="action-popover">
        <el-dropdown-item command="next">添加相邻节点</el-dropdown-item>
        <el-dropdown-item command="sub">添加子节点</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <i
      v-else
      class="icon-btn ea-success el-icon-circle-plus-outline"
      title="添加相邻节点"
      @click="handleCommand('next')" />
    <i
      v-if="showConfirm"
      class="icon-btn ea-danger el-icon-circle-close"
      title="确认删除节点"
      @mouseleave="showConfirm = false"
      @click="handleCommand('remove')" />
    <i
      v-else
      class="icon-btn ea-info el-icon-remove-outline"
      title="删除节点"
      @click="showConfirm = true" />
  </template>
</div>
</template>

<script>
import { allColumns } from './util'
export default {
  props: {
    row: { type: Object, required: true }
  },
  data () {
    const isNotEmpty = allColumns.computeNotEmpty(this.row)
    return {
      isNotEmpty,
      showConfirm: false
    }
  },
  methods: {
    handleCommand (type, evt) {
      this.$emit('edit', { type, evt })
    }
  }
}
</script>

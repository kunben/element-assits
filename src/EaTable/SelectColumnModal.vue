<template>
<EaModal
  :visible.sync="visible"
  :modal="false"
  width="260px"
  class="ea-table-modal"
  append-to-body>
  <div slot="title" class="scm-title" :class="{[size]: 1}">选择列</div>
  <el-tree
    :data="treeData"
    node-key="prop"
    show-checkbox
    :default-checked-keys="defaultCheckedKeys"
    :check-on-click-node="true"
    :class="{[size]: 1}"
    @check-change="handleCheckChange" />
</EaModal>
</template>

<script>
import EaModal from '../EaModal'
export default {
  components: { EaModal },
  props: {
    column: { type: Array, required: true },
    rawColumn: { type: Array, required: true }
  },
  data () {
    const size = this.$ELEMENT && this.$ELEMENT.size || 'small'
    const treeData = this.column
    const defaultCheckedKeys = this.rawColumn.filter(m => m.show !== false).map(m => m.prop)
    return {
      visible: false,
      size,
      treeData,
      defaultCheckedKeys
    }
  },
  mounted () {
    this.visible = true
  },
  methods: {
    handleCheckChange (item, isChecked) {
      this.$emit('check-change', { isChecked, item })
    }
  }
}
</script>

<style lang="scss">
.ea-table-modal {
  overflow: visible;
  right: unset;
  right: initial;
  bottom: unset;
  bottom: initial;
  width: 100%;
  height: 0;
  .el-dialog {
    background: #fdfdfd;
    box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.15);
    .el-dialog__header {
      padding: 12px 20px;
      background-color: $--color-border-extralight;
      border-bottom: 1px solid $--color-border-lighter;
    }
    .el-dialog__headerbtn {
      top: 12px;
    }
    .el-dialog__close {
      font-weight: bold;
      color: $--color-secondary-text;
    }
    .el-dialog__body {
      padding: 10px 0;
      height: calc(100% - 70px);
      min-height: 40px;
      max-height: 800px;
      overflow: auto;
      .scm-title {
        font-size: 12px;
        font-weight: bold;
        color: $--color-primary-text;
        &.medium {
          font-size: 14px;
        }
      }
      .el-tree {
        background: transparent;
        font-size: 12px;
        .el-tree-node__label {
          font-size: 12px;
        }
        &.medium {
          font-size: 14px;
          .el-tree-node__label {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>

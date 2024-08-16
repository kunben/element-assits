<template>
<div class="ea-tree">
  <el-input v-model="filterText" :placeholder="inputPlaceholder">
    <template #prefix>
      <slot name="input-prefix" />
    </template>
    <template #append>
      <slot name="input-append" />
    </template>
  </el-input>
  <EaScrollbar :style="{height: fitHeight + 'px', marginTop: '18px'}">
    <el-tree
      ref="tree"
      class="ea-tree-real"
      :data="options || data"
      :empty-text="endEmptyText"
      :filter-node-method="filterNodeMethod || defaultFilterNodeMethod"
      :props="endProps"
      v-bind="$attrs"
      v-on="$listeners">
      <template v-if="$scopedSlots.default || $slots.default" #default="attrs">
        <slot v-bind="attrs" />
      </template>
    </el-tree>
  </EaScrollbar>
</div>
</template>

<script>
import { isNil } from 'lodash-es'
import EaScrollbar from '../EaScrollbar'
export default {
  components: { EaScrollbar },
  inheritAttrs: false,
  props: {
    inputPlaceholder: {
      type: String,
      default: '请输入关键字搜索'
    },
    remainingHeight: {
      type: Number,
      default: 200
    },
    props: {
      type: Object,
      default: undefined
    },
    data: {
      type: Array,
      default: undefined
    },
    asyncData: {
      type: Function,
      default: undefined
    },
    filterNodeMethod: {
      type: Function,
      default: undefined
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    }
  },
  data () {
    return {
      filterText: undefined,
      loading: false,
      timer: null,
      options: undefined,
      fitHeight: 300
    }
  },
  computed: {
    endProps () {
      return {
        label: 'label',
        value: 'value',
        children: 'children',
        disabled: 'disabled',
        isLeaf: 'isLeaf',
        ...this.props
      }
    },
    endEmptyText () {
      return this.loading ?
        '加载中...'
        : (this.filterText ? '无匹配数据' : this.emptyText)
    }
  },
  watch: {
    filterText (val) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.tree.filter(val)
      }, 300)
    }
  },
  created () {
    if (this.asyncData && !this.$attrs.data) {
      this.loading = true
      this.asyncData().then(data => this.options = data).finally(() => {
        this.loading = false
      })
    }
  },
  mounted () {
    this.resizeFunc()
    window.addEventListener('resize', this.resizeFunc)
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeFunc)
  },
  methods: {
    resizeFunc () {
      this.fitHeight = window.innerHeight - this.remainingHeight
    },
    defaultFilterNodeMethod (text, data) {
      if (!text) return true
      const props = this.endProps
      const label = isNil(data[props.label]) ? '' : String(data[props.label])
      const value = isNil(data[props.value]) ? '' : String(data[props.value])
      return label.indexOf(text) > -1 || value.indexOf(text) > -1
    }
  }
}
</script>

<style lang="scss">
.ea-tree {
  .ea-tree-real {
    .el-tree-node > .el-tree-node__content{
      border-radius: 4px;
    }
    .el-tree-node.is-current > .el-tree-node__content {
      color: $--color-primary;
      background-color: rgba($--color-primary, 0.1);
    }
  }
}
</style>

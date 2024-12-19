<template>
<div :class="{'ea-tree': 1, 'ea-tree--border': border}">
  <el-input v-model="filterText" :placeholder="inputPlaceholder">
    <template #prefix>
      <slot name="input-prefix" />
    </template>
    <template #append>
      <slot name="input-append" />
    </template>
  </el-input>
  <div class="ea-tree__main">
    <slot name="header">
      <div v-if="title" class="ea-tree__header">
        <span class="ea-tree__header__text">{{ title }}</span>
        <slot name="header-append" />
      </div>
    </slot>
    <EaScrollbar :style="{height: fitHeight + 'px'}">
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
    },
    title: {
      type: String,
      default: undefined
    },
    border: {
      type: Boolean,
      default: false
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
      const rh = this.remainingHeight + (this.title ? 60 : 0)
      this.fitHeight = window.innerHeight - rh
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
  .ea-tree__main {
    margin-top: 18px;
    .ea-tree__header {
      height: 50px;
      padding-left: 24px;
      padding-right: 14px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: $--background-color-base;
      .ea-tree__header__text {
        font-weight: bold;
      }
    }
  }
  .ea-tree-real {
    .el-tree-node.is-current > .el-tree-node__content {
      color: $--color-primary;
    }
  }
  &.ea-tree--border {
    .ea-tree__main {
      border: 1px solid $--color-border-lighter;
    }
    .ea-tree__header {
      border-bottom: 1px solid $--color-border-lighter;
    }
    .ea-tree-real {
      margin: 10px 0;
    }
  }
}
</style>

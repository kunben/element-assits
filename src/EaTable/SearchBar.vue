<template>
<EaForm
  ref="eform"
  v-bind="$attrs"
  :column="rawColumn"
  :model="model"
  class="form-on-table"
  label-width="0"
  inline
  @enter="handleSearch">
  <el-form-item ref="sa" label-width="0" class="search-area">
    <el-button icon="el-icon-search" type="primary" @click="handleSearch">搜索</el-button>
    <el-button icon="el-icon-refresh-left" @click="handleReset">重置</el-button>
    <el-tooltip
      :key="showAll"
      :content="moreTooltip"
      :open-delay="700">
      <el-button
        :icon="moreIcon"
        circle
        @click="handleMore" />
    </el-tooltip>
    <el-tooltip content="刷新" :open-delay="700">
      <el-button icon="el-icon-refresh" circle @click="handleRefresh" />
    </el-tooltip>
  </el-form-item>
  <el-form-item ref="tm" label-width="0" style="margin-right: 0;float:right;">
    <slot />
  </el-form-item>
</EaForm>
</template>

<script>
import EaForm from '../EaForm'
import { cloneDeep } from 'lodash-es'
export default {
  components: { EaForm },
  inheritAttrs: false,
  props: {
    column: {
      type: Array,
      required: true
    },
    model: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    // number, auto, all
    limit: {
      type: [Number, String],
      default: 'auto'
    },
    referenceItemWidth: {
      type: Number,
      default: 180
    },
    maxItemWidth: {
      type: Number,
      default: 240
    }
  },
  data () {
    const defaultCount = (
      typeof this.limit === 'number'
        ? this.limit
        : 2
    )
    return {
      allColumn: [],
      rawColumn: [],
      defaultCount,
      showAll: false
    }
  },
  computed: {
    moreIcon () {
      return (
        this.loading
          ? 'el-icon-loading'
          : this.showAll ? 'el-icon-arrow-up' : 'el-icon-more'
      )
    },
    moreTooltip () {
      return (
        (this.limit !== 'all') && (this.allColumn.length > this.defaultCount)
          ? (this.showAll ? '收起搜索条件' : '展开更多搜索条件')
          : '没有更多搜索条件了'
      )
    }
  },
  watch: {
    column: {
      immediate: true,
      deep: true,
      handler (n) {
        const cloneColumn = cloneDeep(n)
        cloneColumn.forEach(m => {
          m.style = m.style || {}
          m.style.width = '180px'
          m.style.marginRight = '10px'
        })
        this.allColumn = cloneColumn
        this.init()
      }
    }
  },
  mounted () {
    const container = this.$refs.eform.$el
    const resizeObserver = new ResizeObserver(() => {
      this.init()
    })
    resizeObserver.observe(container)
    this.$on('hook:destroyed', () => {
      resizeObserver.unobserve(container)
    })
  },
  methods: {
    init () {
      const container = this.$refs.eform && this.$refs.eform.$el
      if (!container) return void(0)
      // 容器可用宽度
      const containerWidth = this.getWidth(container)
      // 搜索按钮宽度
      const saWidth = this.getWidth(this.$refs.sa.$el) + 10
      // 顶部插槽内容宽度
      const tmWidth = this.getWidth(this.$refs.tm.$el)
      // (1) 假设一行啥都不带
      const oneRowCount = Math.floor(containerWidth / this.referenceItemWidth)
      // (2) 假设携带搜索栏
      const oneRowWithSearchCount = Math.floor((containerWidth - saWidth) / this.referenceItemWidth)
      // (3) 假设携带搜索栏和插槽
      const oneRowWithSearchAndSlotCount = Math.floor((containerWidth - saWidth - tmWidth) / this.referenceItemWidth)
      // 默认情况下，需要显示的搜索条件数量
      this.defaultCount = this.limit === 'all' ? this.allColumn.length : (
        typeof this.limit === 'number' ? Math.min(this.limit, this.allColumn.length) : (
          oneRowWithSearchAndSlotCount >= 1 ? oneRowWithSearchAndSlotCount : (
            oneRowWithSearchCount >= 1 ? oneRowWithSearchCount : oneRowCount
          )
        )
      )
      // 最终需要显示的搜索条件数量
      const endShowCount = this.showAll ? this.allColumn.length : this.defaultCount
      // 按照需要显示的数量，计算宽度
      const fitWidth = (
        endShowCount <= oneRowWithSearchAndSlotCount
          ? (containerWidth - saWidth - tmWidth) / endShowCount - 10
          : (
            endShowCount <= oneRowWithSearchCount
              ? (containerWidth - saWidth) / endShowCount - 10
              : (
                endShowCount < oneRowCount
                  ? (containerWidth - (endShowCount - 1) * 10) / endShowCount
                  : (containerWidth - (oneRowCount - 1) * 10) / oneRowCount
              )
          )
      )
      // 需要计算边距的行数量
      const rowEndCount = (
        endShowCount > oneRowWithSearchCount && endShowCount < oneRowCount
          ? endShowCount
          : oneRowCount
      )

      this.allColumn.forEach((m, i) => {
        m.style.width = Math.min(fitWidth, this.maxItemWidth) + 'px'
        if ((i + 1) % rowEndCount === 0) {
          m.style.marginRight = 0
        } else {
          m.style.marginRight = '10px'
        }
      })

      this.resetSearchCount()
    },
    getWidth (el) {
      if (!(el instanceof HTMLElement)) return void(0)
      const wstr = window.getComputedStyle(el).getPropertyValue('width')
      return wstr.replace('px', '') - 0
    },
    resetSearchCount () {
      if (this.limit === 'all') {
        this.rawColumn = this.allColumn
        return void(0)
      }
      this.rawColumn = this.showAll ? this.allColumn : this.allColumn.slice(0, this.defaultCount)
    },
    handleSearch () {
      this.$emit('search')
    },
    handleReset () {
      this.$emit('reset', () => {
        this.$refs.eform.resetFields()
        this.handleSearch()
      })
    },
    handleMore () {
      if (this.limit === 'all') return void(0)
      if (this.allColumn.length <= this.defaultCount) return void(0)
      this.showAll = !this.showAll
      this.resetSearchCount()
    },
    handleRefresh () {
      this.$emit('refresh')
    }
  }
}
</script>

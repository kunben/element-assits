<template>
<div class="ea-select">
  <el-select
    ref="sel"
    :value="value"
    :loading="loading"
    :filter-method="filterMethod"
    :popper-class="'ea-select-popover' + (popperClass ? (' ' + popperClass) : '')"
    :multiple="multiple"
    :no-data-text="originalOptions.length ? noMatchText : noDataText"
    :collapse-tags="isCollapseTags"
    :class="{'is-collapse-tags': isCollapseTags }"
    v-bind="$attrs"
    v-on="{...$listeners, input: handleInput, 'visible-change': handleVisibleChange}">
    <template #prefix>
      <slot name="prefix" />
    </template>
    <template #empty>
      <slot name="empty" />
    </template>
    <div v-if="multiple && showCheckAll" class="tools">
      <el-button type="text" @click="handleSelectAll(1)">全选</el-button>
      <el-button type="text" @click="handleSelectAll(0)">取消全选</el-button>
    </div>
    <slot name="before-option" />
    <VirtualScroll ref="vs" :options="options" :item-size="34">
      <template #item="{item}">
        <el-option
          :key="item[endProps.value]"
          :label="item[endProps.label]"
          :value="item[endProps.value]">
          <template v-if="endProps.desc">
            <span
              class="select-item-value"
              :style="{maxWidth: endItemMaxWidth[0] + 'px'}"
              :title="item[endProps.label]">
              {{ item[endProps.label] }}
            </span>
            <span
              class="select-item-desc"
              :style="{maxWidth: endItemMaxWidth[1] + 'px'}"
              :title="item[endProps.desc]">
              {{ item[endProps.desc] }}
            </span>
          </template>
        </el-option>
      </template>
    </VirtualScroll>
    <slot name="after-option" />
  </el-select>
  <i v-if="loading" class="el-icon-loading async-loading" />
</div>
</template>

<script>
import { isNil, isFunction, cloneDeep } from 'lodash-es'
import VirtualScroll from './VirtualScroll.vue'
export default {
  components: { VirtualScroll },
  inheritAttrs: false,
  props: {
    value: { type: [String, Array, Number], default: undefined },
    label: { type: String, default: undefined },
    data: { type: Array, default: () => [] },
    asyncParams: undefined,
    asyncData: { type: Function, default: undefined },
    props: { type: Object, default: undefined },
    itemMaxWidth: { type: [Number, Array], default: 150 },
    popperClass: { type: String, default: undefined },
    noDataText: { type: String, default: '无数据' },
    noMatchText: { type: String, default: '无匹配数据' },
    multiple: { type: Boolean, default: false },
    showCheckAll: { type: Boolean, default: false },
    collapseTags: { type: Boolean, default: undefined }
  },
  data () {
    return {
      loading: false,
      options: []
    }
  },
  computed: {
    endProps () {
      return { label: 'label', value: 'value', ...this.props }
    },
    endItemMaxWidth () {
      return (
        typeof this.itemMaxWidth === 'number'
          ? [this.itemMaxWidth, this.itemMaxWidth]
          : this.itemMaxWidth
      )
    },
    isCollapseTags () {
      return this.collapseTags === undefined ? this.showCheckAll : this.collapseTags
    }
  },
  watch: {
    data: {
      immediate: true,
      handler (n) {
        this.options = n
        this.originalOptions = cloneDeep(n)
      }
    },
    asyncParams: {
      deep: true,
      handler (n, o) {
        this.init(n, o)
      }
    },
    value () {
      this.cacheCurrent()
    }
  },
  mounted () {
    this.cacheCurrent()
    this.init()
  },
  methods: {
    init (newParams, oldParams) {
      if (isFunction(this.asyncData)) {
        this.loading = true
        let result = this.asyncData(newParams, oldParams)
        if (Array.isArray(result)) result = Promise.resolve(result)
        result.then(list => {
          this.options = list
          this.originalOptions = cloneDeep(list)
          this.cacheCurrent()
        }).finally(() => {
          this.loading = false
        })
      }
    },
    filterMethod (text) {
      this.options = cloneDeep(this.originalOptions).filter(m => {
        if (!text) return true
        const prop = this.endProps.label
        const visibleProp = this.endProps.desc ? this.endProps.desc : this.endProps.value
        const label = isNil(m[prop]) ? '' : String(m[prop])
        const visibleLabel = isNil(m[visibleProp]) ? '' : String(m[visibleProp])
        return label.indexOf(text) > -1 || visibleLabel.indexOf(text) > -1
      })
    },
    cacheCurrent () {
      const found = this.options.find(m => m[this.endProps.value] === this.value)
      const cachedOptions = this.$refs.sel?.cachedOptions || []
      const cachedFound = cachedOptions.find(m => m.value === this.value)
      if (found && !cachedFound) {
        cachedOptions.push({
          currentLabel: found[this.endProps.label],
          label: found[this.endProps.label],
          currentValue: found[this.endProps.value],
          value: found[this.endProps.value]
        })
      }
    },
    handleInput (evt) {
      if (this.$listeners && this.$listeners['obj-change']) {
        if (!this.multiple) {
          const found = this.options.find(m => m[this.endProps.value] === evt)
          this.$emit('obj-change', found)
        } else {
          const founds = this.options.filter(m => evt.includes(m[this.endProps.value]))
          this.$emit('obj-change', founds)
        }
      }
      if (this.$listeners && this.$listeners['update:label']) {
        if (!this.multiple) {
          const found = this.options.find(m => m[this.endProps.value] === evt)
          this.$emit('update:label', found[this.endProps.label])
        }
      }
      this.$emit('input', evt)
    },
    handleVisibleChange (evt) {
      this.$emit('visible-change', evt)
      this.$refs.vs && this.$refs.vs.$emit('visible-change', evt)
      if (evt === false) {
        setTimeout(() => {
          this.options = cloneDeep(this.originalOptions)
        }, 280)
      }
    },
    handleSelectAll (bool) {
      this.$emit('input', bool ? this.options.map(m => m[this.endProps.value]) : [])
    }
  }
}
</script>

<style lang="scss">
.ea-select {
  display: inline-block;
  position: relative;
  .el-select {
    width: 100%;
  }
  .async-loading.el-icon-loading {
    position: absolute;
    top: 10px;
    right: 28px;
    color: #999;
  }
  .is-collapse-tags .el-select__tags > span > .el-tag:first-child {
    min-width: 36px;
    max-width: calc(100% - 80px);
  }
}
.ea-select-popover {
  .el-select-dropdown__item {
    display: flex;
    justify-content: space-between;
    .select-item-value {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .select-item-desc {
      overflow: hidden;
      text-overflow: ellipsis;
      color: #8492a6;
      margin-left: 8px;
    }
  }
  .tools {
    padding: 0 20px;
    margin-bottom: -5px;
  }
}
</style>

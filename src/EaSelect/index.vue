<template>
<div class="ea-select">
  <el-select
    ref="sel"
    :value="value"
    :loading="loading"
    :filter-method="filterMethod"
    :popper-class="'ea-select-popover' + (popperClass ? (' ' + popperClass) : '')"
    :no-data-text="originalOptions.length ? noMatchText : noDataText"
    v-bind="$attrs"
    v-on="{...$listeners, input: handleInput, 'visible-change': handleVisibleChange}">
    <el-option
      v-for="item in cachedOptions"
      :key="item[endProps.value]"
      :label="item[endProps.label]"
      :value="item[endProps.value]"
      style="display:none;" />
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
  </el-select>
  <i v-if="loading" class="el-icon-loading async-loading" />
</div>
</template>

<script>
import { isFunction, cloneDeep } from 'lodash-es'
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
    noMatchText: { type: String, default: '无匹配数据' }
  },
  data () {
    return {
      checkAll: false,
      indeterminate: false,
      loading: false,
      options: [],
      cachedOptions: []
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
    'options.length' (n) {
      if (n === 0) this.cachedOptions = []
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
        }).finally(() => {
          this.loading = false
        })
      }
    },
    filterMethod (text) {
      this.options = cloneDeep(this.originalOptions).filter(m => {
        return m.label.indexOf(text) > -1
      })
    },
    cacheCurrent () {
      const found = this.options.find(m => m[this.endProps.value] === this.value)
      const cachedFound = this.cachedOptions.find(m => m[this.endProps.value] === this.value)
      if (found && !cachedFound) this.cachedOptions.push(found)
    },
    handleInput (evt) {
      this.$emit('input', evt)
      this.$nextTick(() => {
        this.cacheCurrent()
      })
      if (this.label !== undefined || this.$listeners['obj-change']) {
        const found = this.options.find(m => m[this.endProps.value] === evt)
        if (found) {
          this.$emit('update:label', found[this.endProps.label])
          this.$emit('obj-change', found)
        }
      }
    },
    handleVisibleChange (evt) {
      this.$emit('visible-change', evt)
      this.$refs.vs && this.$refs.vs.$emit('visible-change', evt)
      if (evt === false) {
        setTimeout(() => {
          this.options = cloneDeep(this.originalOptions)
        }, 280)
      }
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
}
</style>

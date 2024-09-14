<template>
<div v-if="isNeedVs" ref="container" :style="{height: options.length * itemSize + 'px'}">
  <div ref="wrapper" :style="{position: 'relative', top: showCurrent * itemSize + 'px'}">
    <template v-for="(item, ind) in options.slice(showCurrent, showCurrent + redundancy)">
      <slot name="item" :item="item" :index="showCurrent + ind">
        <div :key="ind" :style="{height: itemSize + 'px'}">
          {{ item }}
        </div>
      </slot>
    </template>
    <slot name="after" />
  </div>
</div>
<div v-else>
  <template v-for="(item, ind) in options">
    <slot name="item" :item="item" :index="ind">
      <div :key="ind" :style="{height: itemSize + 'px'}">{{ item }}</div>
    </slot>
  </template>
  <slot name="after" />
</div>
</template>

<script>
import { get, throttle } from 'lodash-es'
export default {
  props: {
    enableVirtualScroll: { type: [Boolean, String], default: 'auto' },
    options: { type: Array, required: true },
    itemSize: { type: Number, default: 30, required: true },
    redundancy: { type: Number, default: 60 }
  },
  data () {
    const scrollFunc = () => {
      const container = this.getContainer()
      // 每次滚动结束后，计算滚出的距离相当于多少项
      // 立即向下平移wrapper，以上这么多项的距离
      // 同时立即从原始数据种，取出从以上这么多项开始的数据，并渲染到页面上
      // 看似滚动了，其实没有滚动
      // 元素没变，但是数据变了
      if (!container) return void(0)
      this.current = Math.floor(container.scrollTop / this.itemSize)
      this.$emit('scroll-recalc', {
        container,
        current: this.current
      })
    }
    const throttleFunc = throttle(scrollFunc, 100)
    return {
      current: 0,
      throttleFunc
    }
  },
  computed: {
    isNeedVs () {
      if (this.enableVirtualScroll === 'auto') {
        return this.options && (this.options.length > 100)
      }
      return this.enableVirtualScroll
    },
    showCurrent () {
      return Math.max(0, this.current - Math.ceil(this.redundancy / 3))
    }
  },
  watch: {
    isNeedVs: {
      immediate: true,
      async handler (n) {
        await this.$nextTick()
        this.remove()
        n && this.add()
      }
    }
  },
  created () {
    this.$on('visible-change', evt => {
      if (evt === false) this.current = 0
    })
  },
  methods: {
    getContainer () {
      const parent = get(this, '$refs.container.parentElement')
      if (!parent) return void(0)
      if (parent.classList.contains('el-scrollbar__view')) {
        return get(this, '$refs.container.parentElement.parentElement')
      }
      return parent
    },
    add () {
      const container = this.getContainer()
      if (!container) return void(0)
      this.throttleFunc()
      container.addEventListener('scroll', this.throttleFunc)
    },
    remove () {
      const container = this.getContainer()
      container && container.removeEventListener('scroll', this.throttleFunc)
    }
  }
}
</script>

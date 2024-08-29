<template>
<div v-if="isNeedVs" ref="container" :style="{height: options.length * itemSize + 'px'}">
  <div ref="wrapper" :style="{position: 'relative', top: current * itemSize + 'px'}">
    <template v-for="(item, ind) in options.slice(current, current + redundancy)">
      <slot name="item" :item="item" :index="current + ind" />
    </template>
    <slot name="after" />
  </div>
</div>
<div v-else>
  <template v-for="(item, ind) in options">
    <slot name="item" :item="item" :index="ind" />
  </template>
  <slot name="after" />
</div>
</template>

<script>
import { get } from 'lodash-es'
export default {
  props: {
    options: { type: Array, required: true },
    itemSize: { type: Number, required: true },
    redundancy: { type: Number, default: 30 }
  },
  data () {
    return {
      current: 0,
      timer: null
    }
  },
  computed: {
    isNeedVs () {
      return this.options && (this.options.length > 100)
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
      return get(this, '$refs.container.parentElement.parentElement')
    },
    scrollFunc () {
      const container = this.getContainer()
      // 每次滚动结束后，计算滚出的距离相当于多少项
      // 立即向下平移wrapper，以上这么多项的距离
      // 同时立即从原始数据种，取出从以上这么多项开始的数据，并渲染到页面上
      // 看似滚动了，其实没有滚动
      // 元素没变，但是数据变了
      clearTimeout(this.timer)
      if (!container) return void(0)
      this.timer = setTimeout(() => {
        this.current = Math.floor(container.scrollTop / this.itemSize)
      }, 100)
    },
    add () {
      const container = this.getContainer()
      if (!container) return void(0)
      this.scrollFunc()
      container.addEventListener('scroll', this.scrollFunc)
    },
    remove () {
      const container = this.getContainer()
      container && container.removeEventListener('scroll', this.scrollFunc)
    }
  }
}
</script>

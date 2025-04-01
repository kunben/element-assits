<template>
<EaScrollbar class="ea-list" :style="{height: fitHeight + 'px'}">
  <EaVirtualScroll :options="realOptions" :item-size="itemSize" :redundancy="redundancy">
    <template #item="attrs">
      <slot v-bind="attrs">
        <div :style="{height: itemSize + 'px'}">{{ attrs.item.label }}</div>
      </slot>
    </template>
    <div v-if="loading" slot="after" class="loading-text">加载中...</div>
    <div v-else-if="!realOptions.length" slot="after" class="loading-text">暂无数据</div>
  </EaVirtualScroll>
</EaScrollbar>
</template>

<script>
import EaScrollbar from '../EaScrollbar'
import EaVirtualScroll from '../EaSelect/VirtualScroll.vue'
export default {
  components: { EaScrollbar, EaVirtualScroll },
  props: {
    data: { type: Array, default: undefined },
    pageRequest: { type: Function, default: undefined },
    initRequest: { type: Boolean, default: true },
    itemSize: { type: Number, default: 30 },
    remainingHeight: { type: Number, default: 200 },
    page: { type: Object, default: undefined },
    redundancy: { type: Number, default: undefined }
  },
  data () {
    const pager = {
      current: 1,
      pageSize: 50,
      total: 0,
      ...this.page
    }
    return {
      options: [],
      loading: false,
      pager,
      fitHeight: 300
    }
  },
  computed: {
    realOptions () {
      return this.data || this.options
    }
  },
  mounted () {
    this.resizeFunc()
    window.addEventListener('resize', this.resizeFunc)
    if (!this.pageRequest) return void(0)
    if (this.initRequest) this.getList()
    this.addScroll()
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeFunc)
  },
  methods: {
    handleSearch () {
      this.pager.current = 1
      this.options = []
      this.getList()
    },
    async getList (isNext = false) {
      if (this.loading === true) return void(0)
      this.loading = true
      if (isNext) {
        await this.$nextTick()
        this.scrollToBottom()
      }
      Promise.all([
        this.pageRequest(this.pager),
        new Promise(r => setTimeout(r, 380))
      ]).then(([{ data, total }]) => {
        this.options.push(...data)
        this.pager.total = total
      }).finally(() => {
        this.loading = false
      })
    },
    scrollNext () {
      if (this.loading === true) return void(0)
      if (this.pager.current * this.pager.pageSize > this.pager.total) return void(0)
      this.pager.current ++
      this.getList(true)
    },
    addScroll () {
      const container = this.$el.querySelector('.el-scrollbar__wrap')
      const wrapper = this.$el.querySelector('.el-scrollbar__view')
      if (!container || !wrapper) return null

      let prevScrollTop = 0

      container.addEventListener('scroll', evt => {
        // container
        const scrollTop = container.scrollTop
        // scrollScopeMax
        const padding = 12
        const ch = container.clientHeight - padding
        const wh = wrapper.offsetHeight
        const scrollScopeMax = wh - ch
        // tolerance
        const tolerance = 20
        // judge
        const inScope = scrollTop > (scrollScopeMax - tolerance)
        // direction
        const direction = prevScrollTop - scrollTop > 0 ? 'up' : 'down'
        prevScrollTop = scrollTop
        // func
        if (inScope && direction === 'down') {
          this.scrollNext()
          evt.preventDefault()
          evt.stopPropagation()
        }
      })
    },
    scrollToBottom () {
      const container = this.$el.querySelector('.el-scrollbar__wrap')
      let i = 0
      let animateTimer = setInterval(() => {
        i += 2
        container.scrollTop = container.scrollTop + i
        if (i >= 20) clearInterval(animateTimer)
      }, 20)
    },
    resizeFunc () {
      this.fitHeight = window.innerHeight - this.remainingHeight
    }
  }
}
</script>

<style lang="scss">
.ea-list {
  .loading-text {
    color: $--color-secondary-text;
    text-align: center;
    font-size: inherit;
  }
}
</style>

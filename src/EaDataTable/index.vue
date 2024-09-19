<template>
<div :class="{'ea-data-table': 1, 'ea-data-table--border': border}">
  <div
    class="edt-row edt-header"
    :style="{height: itemSize + 'px'}">
    <template v-for="m in realColumn">
      <span
        v-if="!m.renderHeader"
        :key="m.prop"
        :style="cellStyle(m)"
        :title="m.label"
        class="edt-cell">{{ m.label }}</span>
      <component
        :is="{render: h => m.renderHeader(h, { column: m })}"
        v-else
        :key="m.prop"
        :style="cellStyle(m)"
        class="edt-cell" />
    </template>
  </div>
  <EaScrollbar
    :style="{height: fitHeight + 'px'}">
    <EaVirtualScroll :options="realOptions" :item-size="itemSize" :redundancy="redundancy">
      <template #item="attrs">
        <slot v-bind="attrs">
          <div
            v-if="!realColumn"
            :style="{height: itemSize + 'px'}">{{ attrs.item }}</div>
          <div
            v-else
            class="edt-row"
            :style="{height: itemSize + 'px'}">
            <template v-for="m in realColumn">
              <span
                v-if="!m.render"
                :key="m.prop + attrs.index"
                :style="cellStyle(m)"
                :title="attrs.item[m.prop]"
                class="edt-cell">{{ attrs.item[m.prop] }}</span>
              <component
                :is="generateRender(attrs, m)"
                v-else
                :key="m.prop + attrs.index"
                :style="cellStyle(m)"
                class="edt-cell" />
            </template>
          </div>
        </slot>
      </template>
      <div
        v-if="loading"
        slot="after"
        class="loading-text"
        :style="textStyle()">加载中...</div>
      <div
        v-else-if="!realOptions.length"
        slot="after"
        class="loading-text"
        :style="textStyle()">暂无数据</div>
    </EaVirtualScroll>
  </EaScrollbar>
</div>
</template>

<script>
import EaScrollbar from '../EaScrollbar'
import EaVirtualScroll from '../EaSelect/VirtualScroll.vue'
export default {
  components: { EaScrollbar, EaVirtualScroll },
  props: {
    data: { type: Array, default: undefined },
    column: { type: Array, default: undefined },
    pageRequest: { type: Function, default: undefined },
    initRequest: { type: Boolean, default: true },
    itemSize: { type: Number, default: 30 },
    maxHeight: { type: Number, default: 300 },
    page: { type: Object, default: undefined },
    redundancy: { type: Number, default: undefined },
    border: { type: Boolean, default: false }
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
      pager
    }
  },
  computed: {
    fitHeight () {
      const len = this.realOptions.length || 1
      return Math.min(len * this.itemSize, this.maxHeight)
    },
    realOptions () {
      return this.data || this.options
    },
    realColumn () {
      if (!this.column || !this.column.length) return false
      return this.column.map(item => {
        item.width = item.width || 100
        return item
      })
    }
  },
  mounted () {
    if (!this.pageRequest) return void(0)
    if (this.initRequest) this.getList()
    this.addScroll()
  },
  methods: {
    handleSearch () {
      this.page.current = 1
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
    generateRender (attrs, column) {
      return {
        render: h => column.render(h, {
          row: attrs.item,
          index: attrs.index,
          column,
          value: attrs.item[column.prop],
          that: this
        })
      }
    },
    cellStyle (m) {
      return {
        width: m.width + 'px',
        flex: m.flex,
        textAlign: m.align
      }
    },
    textStyle () {
      return {
        height: this.itemSize + 'px',
        lineHeight: this.itemSize + 'px'
      }
    }
  }
}
</script>

<style lang="scss">
.ea-data-table {
  .edt-row {
    display: flex;
    line-height: 30px;
    .edt-cell {
      padding: 0 8px;
      flex: 0 0 auto;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-all;
    }
    &.edt-header {
      background-color: $--color-border-extralight;
      color: $--color-primary-text;
    }
  }
  &--border {
    border: 1px solid $--color-border-light;
    .edt-row {
      .edt-cell {
        border-bottom: 1px solid $--color-border-light;
        border-left: 1px solid $--color-border-light;
        &:first-child {
          border-left: 0;
        }
      }
      &:last-child .edt-cell{
        border-bottom: 0;
      }
    }
  }
  .loading-text {
    color: $--color-secondary-text;
    text-align: center;
    font-size: inherit;
  }
}
</style>

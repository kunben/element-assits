<template>
<div class="ea-table">
  <slot name="search">
    <SearchBar
      v-if="theForm.show"
      ref="shbr"
      v-bind="theForm.attrs"
      :column="theForm.attrs.column"
      :model="theForm.attrs.model"
      @search="handleSearch"
      @refresh="handleRefresh"
      @reset="handleReset">
      <slot name="top-menu" />
    </SearchBar>
  </slot>
  <div v-loading="loading === undefined ? innerLoading : loading">
    <slot name="table" :data="tableData">
      <el-table
        ref="table"
        :class="{'is-dense': dense, 'is-unready': !isReady}"
        :data="tableData"
        v-bind="{
          border: true,
          stripe: true,
          'empty-text': errMsg || '暂无数据',
          ...$attrs
        }"
        v-on="$listeners"
        @selection-change="handleSelectionChange">
        <slot name="before-column" />
        <el-table-column
          v-if="theIndex.show"
          v-bind="{ label: '序号', align: 'center', fixed: false, width: 50 + Math.ceil((String(page.current).length - 1) * 7), ...theIndex.attrs }"
          type="index">
          <template #default="{$index}">
            {{ (asyncPageCurrent - 1) * page.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <slot name="after-index-column" />
        <el-table-column
          v-if="theSelection.show"
          v-bind="{ align: 'center', fixed: false, width: 50, ...theSelection.attrs }"
          type="selection" />
        <slot name="after-selection-column" />
        <el-table-column
          v-for="item in rawColumn.filter(m => m.show !== false)"
          :key="item.key"
          :label="item.label"
          :prop="item.prop"
          v-bind="item.bind"
          v-on="item.on">
          <template v-if="item.bind.render" #default="{row, column: elColumn}">
            <component :is="generateRender(row, item, elColumn)" :key="cellKey" />
          </template>
          <template v-else #default="{row, column: elColumn}">
            <template v-if="getIsNilCellTextByColumn(elColumn) && isNil(row[elColumn.property])">
              {{ getIsNilCellTextByColumn(elColumn) }}
            </template>
            <template v-else>
              {{ row[elColumn.property] }}
            </template>
          </template>
        </el-table-column>
        <slot name="before-action-column" />
        <el-table-column
          v-if="theOperation.show"
          v-bind="{ label: '操作', align: 'center', fixed: false, ...theOperation.attrs }">
          <template #default="scope">
            <component
              :is="theOperation.render"
              v-if="theOperation.render"
              :key="uuid()"
              :scope="scope" />
            <div v-else :key="uuid()">
              <slot name="row-menu" v-bind="scope" />
            </div>
          </template>
        </el-table-column>
        <slot name="after-column" />
        <template #empty>
          <slot name="empty" />
        </template>
      </el-table>
    </slot>
  </div>
  <slot name="footer">
    <div class="ea-table__footer" :class="{'is-unready': !isReady}">
      <div><slot name="bottom-menu" /></div>
      <el-pagination
        v-if="thePagination.show && page.total"
        class="ea-table__footer-right"
        :page-size="page.pageSize"
        :current-page="page.current"
        :total="page.total"
        v-bind="thePagination.attrs"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </slot>
</div>
</template>

<script>
import SearchBar from './SearchBar.vue'
import { columnMenu, middleRender } from './theader'
import { uuid } from '../util'
import { omit, isArray, isPlainObject, isFunction, cloneDeep, isNil } from 'lodash-es'
import { AutoFitOpt, innerToThe, checkOperation } from './operation'
export default {
  components: { SearchBar },
  inheritAttrs: false,
  props: {
    column: { type: Array, default: () => [] },
    data: { type: Array, default: () => [] },
    loading: { type: Boolean, default: undefined },
    initRequest: { type: [Boolean, Function], default: true },
    pageRequest: { type: Function, default: undefined },
    columnControl: { type: Boolean, default: true },
    dense: { type: Boolean, default: false },
    innerForm: { type: [Boolean, Object], default: false },
    innerIndex: { type: [Boolean, Object], default: true },
    innerSelection: { type: [Boolean, Object], default: false },
    innerPagination: { type: [Boolean, Object], default: true },
    innerOperation: { type: [Boolean, Object], default: undefined },
    isNilCellText: { type: [Boolean, String], default: undefined }
  },
  data () {
    const page = {
      current: 1,
      pageSize: this.innerPagination?.pageSize || 10,
      total: 0
    }
    return {
      uuid,
      isNil,
      rawColumn: [],
      columnMenu,
      innerLoading: false,
      errMsg: undefined,
      asyncPageCurrent: 1,
      page,
      tableData: [],
      searchForm: {},
      cellKey: Date.now(),
      fitOpt: undefined,
      optWidth: undefined,
      isInit: false,
      isReady: false
    }
  },
  computed: {
    theForm () {
      let show, attrs
      if (!isPlainObject(this.innerForm)) {
        show = Boolean(this.innerForm)
        attrs = { model: this.searchForm }
      } else {
        show = this.innerForm.show !== false
        attrs = {
          column: [],
          model: this.searchForm,
          ...omit(this.innerForm, 'show')
        }
      }
      return { show, attrs }
    },
    theOperation () {
      let show, render, attrs = { width: undefined }
      if (this.innerOperation === undefined) {
        // 没有显式设置operation (是否显示操作栏由插槽决定)
        const { showAction, collapseBtnRender } = checkOperation.bind(this)()
        show = showAction
        render = collapseBtnRender
      } else if(!isPlainObject(this.innerOperation)) {
        // 显式地设置为其他值 (由设置的值决定)
        show = Boolean(this.innerOperation)
      } else {
        // 显式设置为对象
        const maxNumOfBtn = this.innerOperation.maxNumOfBtn
        const { showAction, collapseBtnRender } = checkOperation.bind(this)(maxNumOfBtn)
        const _show = this.innerOperation.show
        show = _show === undefined ? showAction : Boolean(_show)
        render = collapseBtnRender
        Object.assign(attrs, omit(
          this.innerOperation,
          ['show', 'maxNumOfBtn', 'enableAutoWidth', 'width', 'minWidth']
        ))
      }

      // 是否启用自动宽度（默认启用）
      const enableAutoWidth = this.innerOperation?.enableAutoWidth !== false
      // 设置的固定宽度
      const fixedWidth = this.innerOperation?.width
      // 设置的最小宽度
      const minWidth = this.innerOperation?.minWidth

      if (enableAutoWidth && !fixedWidth && (typeof minWidth !== 'string')) {
        // 当 启用自动宽度 并且 没有设置固定宽度 并且 最小宽度非字符串格式 时，应用自动宽度
        if (this.optWidth) {
          // 自动宽度是一个有效的值
          attrs.width = Math.max(this.optWidth, minWidth || 120)
        } else {
          // 自动宽度不是一个有效的值
          attrs.width = typeof minWidth === 'number' ? (minWidth + 'px') : minWidth
        }
      } else {
        // 反之 应用固定宽度 (采用默认模式)
        attrs.width = fixedWidth
        attrs.minWidth = minWidth
      }

      attrs.className = [attrs.className, 'operation-column'].filter(Boolean).join(' ')

      return { show, render, attrs }
    },
    thePagination () {
      return innerToThe(this.innerPagination, {
        pageSizes: [10, 20, 50, 100],
        layout: 'total, sizes, prev, pager, next, jumper'
      })
    },
    theIndex () {
      return innerToThe(this.innerIndex)
    },
    theSelection () {
      return innerToThe(this.innerSelection)
    },
    theIsNilCellText () {
      const gt = this.$ELEMENT_ASSITS?.isNilCellText
      return this.isNilCellText === undefined ? gt : this.isNilCellText
    }
  },
  watch: {
    column: {
      immediate: true,
      handler (n) {
        this.columnWatcher(n)
      }
    },
    data: {
      handler () {
        this.handleRefresh()
      }
    },
    tableData: {
      handler () {
        if (this.innerOperation?.enableAutoWidth === false) return void(0)
        this.fitOpt = new AutoFitOpt(this.tableData, num => {
          this.optWidth = num
        })
      }
    }
  },
  mounted () {
    // init
    const init = () => {
      if (isFunction(this.initRequest)) {
        this.initRequest(() => this.handleSearch())
      } else {
        this.initRequest && this.handleSearch()
      }
    }
    if (this.$refs.shbr) {
      this.$refs.shbr.$once('init', init)
    } else {
      init()
    }
    // ready
    const time = 60
    setTimeout(() => {
      if (!this.innerLoading) {
        this.isReady = true
      } else {
        const unWatch = this.$watch(() => this.innerLoading, n => {
          if (n === false) {
            unWatch()
            setTimeout(() => {
              this.isReady = true
            }, time)
          }
        })
      }
    }, time)
  },
  methods: {
    middleRender,
    columnWatcher (n) {
      if (!isArray(n)) return void(0)
      const cloneColumn = cloneDeep(n)
      cloneColumn.forEach((m, i) => {
        if (m.show === undefined) this.$set(m, 'show', true)
        if (m.key === undefined) this.$set(m, 'key', uuid())
        if (m.sort === undefined) m.sort = i
        m.bind = m.bind || {}
        m.bind.render = m.bind.render || m.render
        if (this.columnControl) {
          m.bind.renderHeader = this.middleRender(m.bind.renderHeader)
        }
      })
      this.rawColumn = cloneColumn
    },
    handleTriggerMenu (item, prop) {
      const time = 300
      const ind = this.rawColumn.findIndex(m => m.prop === prop)
      const found = this.rawColumn[ind]
      const findBeforePosition = (n) => {
        let _ind = this.rawColumn.findIndex(m => {
          if (!(m.bind.fixed === undefined || m.bind.fixed === false)) return false
          if (m.sort > n.sort) {
            return true
          }
        })
        _ind = _ind < 0 ? (this.rawColumn.length - 1) : _ind
        return _ind < 0 ? 0 : _ind
      }
      switch (item.value) {
        case 1: // 隐藏此列
          found.bind.className = 'column-transition-active'
          found.key = uuid()
          setTimeout(() => {
            found.show = false
            found.key = uuid()
            this.$nextTick(() => this.$refs.table.doLayout())
          }, time)
          break
        case 11: // 显示
          found.bind.className = 'column-transition-active'
          found.show = true
          found.key = uuid()
          this.$nextTick(() => this.$refs.table.doLayout())
          setTimeout(() => {
            found.bind.className = ''
            found.key = uuid()
          }, time)
          break
        case 21: // 取消固定
          this.rawColumn.splice(ind, 1)
          this.rawColumn.splice(findBeforePosition(found), 0, found)
          found.bind.fixed = false
          found.bind.className = 'column-transition-active'
          found.key = uuid()
          setTimeout(() => {
            found.bind.className = ''
            found.key = uuid()
            this.$nextTick(() => this.$refs.table.doLayout())
          }, time)
          break
        case 22: // 固定到左侧
          this.rawColumn.splice(ind, 1)
          this.rawColumn.push(found)
          found.bind.fixed = true
          found.bind.className = 'column-transition-active'
          found.key = uuid()
          this.$nextTick(() => this.$refs.table.doLayout())
          setTimeout(() => {
            found.bind.className = ''
            found.key = uuid()
            this.$nextTick(() => this.$refs.table.doLayout())
          }, time)
          break
        case 23: // 固定到右侧
          this.rawColumn.splice(ind, 1)
          this.rawColumn.unshift(found)
          found.bind.fixed = 'right'
          found.bind.className = 'column-transition-active'
          found.key = uuid()
          this.$nextTick(() => this.$refs.table.doLayout())
          setTimeout(() => {
            found.bind.fixed = 'right'
            found.bind.className = ''
            found.key = uuid()
            this.$nextTick(() => this.$refs.table.doLayout())
          }, time)
          break
        case 3: // 选择列
          this.$asyncLoad(() => import('./SelectColumnModal'), {
            props: { column: this.column, rawColumn: this.rawColumn },
            on: {
              'check-change': ({ isChecked, item }) => {
                this.handleTriggerMenu({ value: isChecked ? 11 : 1 }, item.prop)
              }
            }
          })
          break
        case 4: // 重置全部列
          this.columnWatcher(this.column)
          this.$nextTick(() => this.$refs.table.doLayout())
          break
        default: break
      }
    },
    getIsNilCellTextByColumn (column) {
      return column.isNilCellText === undefined ? this.theIsNilCellText : column.isNilCellText
    },
    generateRender (row, column, _column) {
      return {
        render: (h) => {
          const value = row[column.prop]
          const isNilCellText = this.getIsNilCellTextByColumn(column)
          if (isNilCellText && isNil(value)) {
            return h('span', isNilCellText)
          }
          return column.bind.render(
            h,
            {
              row,
              column,
              value,
              _column,
              that: this,
              hideRefresh: () => this.hideRefresh()
            }
          )
        }
      }
    },
    getList () {
      if (!this.pageRequest) {
        let data = []
        if (this.thePagination.show) {
          const start = (this.page.current - 1) * this.page.pageSize
          data = this.data.slice(start, start + this.page.pageSize)
        } else {
          data = this.data
        }
        this.tableData = data
        this.page.total = this.data.length
        this.asyncPageCurrent = this.page.current
        return Promise.resolve()
      }
      this.innerLoading = true
      this.errMsg = undefined
      return this.pageRequest(this.page, this.theForm.attrs.model).then(res => {
        const { data, total, current } = res || {}
        this.tableData = data || []
        this.page.total = total || 0
        this.asyncPageCurrent = current || this.page.current
        if (isArray(this.tableData) && !this.tableData.length && this.page.current > 1) {
          this.handleCurrentChange(this.page.current - 1)
        }
      }).catch(err => {
        this.errMsg = err && err.message
      }).finally(() => {
        this.innerLoading = false
      })
    },
    // 隐式刷新表格
    hideRefresh () {
      this.cellKey = Date.now()
    },
    // 表格搜索
    handleSearch () {
      const isEmptyData = this.tableData?.length === 0
      if (isEmptyData) this.isReady = false
      this.page.current = 1
      return this.getList().finally(() => {
        if (isEmptyData) {
          setTimeout(() => {
            this.isReady = true
          }, 60)
        }
      })
    },
    // 表格刷新
    handleRefresh () {
      return this.getList()
    },
    // 表格重置
    handleReset ({ callback, reset, search }) {
      if (this.$listeners['search-reset']) {
        this.$emit('search-reset', { callback, reset, search })
      } else {
        callback && callback()
      }
    },
    // 表格清空
    handleClear () {
      this.tableData = []
      this.page.total = 0
    },
    handleSizeChange (size) {
      this.page.pageSize = size
      this.getList()
    },
    handleCurrentChange (curr) {
      this.page.current = curr
      this.getList()
      this.$nextTick(() => {
        this.$refs.table && this.$refs.table.doLayout()
      })
    },
    handleSelectionChange (rows) {
      const data = this.innerSelection && this.innerSelection.data
      if (!isArray(data)) return void(0)
      data.splice(0, data.length, ...rows)
    }
  }
}
</script>

<style lang="scss">
// table
.ea-table {
  // 表格头部样式美化
  .el-table {
    transition: opacity 0.28s;
    th {
      background-color: $--background-color-base;
      color: $--color-primary-text;
      .cell {
        min-height: 30px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }
      &.is-center .cell { justify-content: center }
      &.is-right .cell { justify-content: flex-end }
    }
    td, th {
      .cell {
        line-height: 1.2;
      }
    }
    &.el-table--small {
      td, th {
        height: 50px;
      }
    }
    &.is-dense {
      td, th {
        height: 32px;
        padding: 2px 0;
        .el-button {
          padding-top: 0;
          padding-bottom: 0;
        }
      }
    }
    &.is-unready {
      opacity: 0;
      .operation-column > div {
        height: 32px;
        overflow: hidden;
      }
      &.is-dense {
        .operation-column > div {
          height: 24px;
        }
      }
    }
  }
  // 列的更多菜单项
  .theader-th-cell {
    .cell-icon-menu {
      position: absolute;
      top: 50%;
      right: 4px;
      transform: rotate(90deg) translateX(-50%);
      color: $--color-placeholder-text;
      cursor: pointer;
      padding: 4px;
      border-radius: 2px;
      &:hover {
        color: $--color-primary-text;
        background-color: $--color-border-light;
      }
    }
  }
  // 表格底部
  .ea-table__footer {
    display: flex;
    justify-content: space-between;
    transition: opacity 0.28s;
    .ea-table__footer-right {
      margin-left: auto;
      padding-right: 0;
    }
    > * {
      margin-top: 12px;
    }
    &.is-unready {
      opacity: 0;
    }
  }

  .column-transition-active {
    opacity: 0.33;
  }

  .el-button > i {
    min-width: 12px;
  }

  .more-btn > i{
    transform: rotate(-90deg);
  }
}

// table - popover
.el-popover.ea-popover-no-padding {
  padding: 8px 0;
  min-width: 100px;
  &.dense {
    margin-top: 0px;
    margin-bottom: 0px;
    min-width: 70px;
  }
}

.more-btn-panel {
  &__item {
    &:hover {
      background-color: $--color-border-lighter;
    }
    .el-button {
      padding: 8px 12px;
      width: 100%;
      text-align: left;
    }
  }
}

.ea-zoom-in-top-enter-active,
.ea-zoom-in-top-leave-active {
  opacity: 1;
  transform: scaleY(1);
  transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: center top;
}
.ea-zoom-in-top-enter,
.ea-zoom-in-top-leave-active {
  opacity: 0;
  transform: scaleY(0);
}
</style>

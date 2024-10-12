<template>
<div class="ea-table">
  <slot name="search">
    <SearchBar
      v-if="theForm.show"
      v-bind="theForm.attrs"
      :column="theForm.attrs.column"
      :model="theForm.attrs.model"
      @search="handleSearch"
      @refresh="handleRefresh"
      @reset="handleReset">
      <slot name="top-menu" />
    </SearchBar>
  </slot>
  <slot name="table" :data="tableData">
    <div v-loading="loading === undefined ? innerLoading : loading">
      <el-table
        ref="table"
        :class="{'is-dense': dense}"
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
    </div>
  </slot>
  <slot name="footer">
    <div class="ea-table__footer">
      <div><slot name="bottom-menu" /></div>
      <el-pagination
        v-if="thePagination.show && page.total"
        class="ea-table__footer-right"
        layout="total, sizes, prev, pager, next, jumper"
        :page-size="page.pageSize"
        :current-page="page.current"
        :total="page.total"
        :page-sizes="[10, 20, 50, 100]"
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
import { get, omit, isArray, isPlainObject, cloneDeep } from 'lodash-es'
import { AutoFitOpt, innerToThe, checkOperation } from './operation'
export default {
  components: { SearchBar },
  inheritAttrs: false,
  props: {
    column: { type: Array, default: () => [] },
    data: { type: Array, default: () => [] },
    loading: { type: Boolean, default: undefined },
    initRequest: { type: Boolean, default: true },
    pageRequest: { type: Function, default: undefined },
    columnControl: { type: Boolean, default: true },
    dense: { type: Boolean, default: false },
    innerForm: { type: [Boolean, Object], default: false },
    innerIndex: { type: [Boolean, Object], default: true },
    innerSelection: { type: [Boolean, Object], default: false },
    innerPagination: { type: [Boolean, Object], default: true },
    innerOperation: { type: [Boolean, Object], default: undefined }
  },
  data () {
    const page = {
      current: 1,
      pageSize: 10,
      total: 0
    }
    const optWidth = get(this.innerOperation, 'width') || 180
    return {
      uuid,
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
      optWidth
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
      let show, render, attrs = { width: this.optWidth }
      if (this.innerOperation === undefined) {
        // 没有显示设置operation (是否显示操作栏由插槽决定)
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
        const excludesFields = ['show', 'maxNumOfBtn', 'enableAutoWidth', 'width']
        Object.assign(attrs, omit(this.innerOperation, excludesFields))
      }
      return { show, render, attrs }
    },
    thePagination () {
      return innerToThe(this.innerPagination)
    },
    theIndex () {
      return innerToThe(this.innerIndex)
    },
    theSelection () {
      return innerToThe(this.innerSelection)
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
        if (!this.innerOperation?.enableAutoWidth) return void(0)
        this.fitOpt = new AutoFitOpt(this.tableData, num => {
          this.optWidth = num
        })
      }
    }
  },
  mounted () {
    this.initRequest && this.handleSearch()
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
    generateRender (row, column, _column) {
      return {
        render: (h) => {
          return column.bind.render(
            h,
            {
              row,
              column,
              value: row[column.prop],
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
        const start = (this.page.current - 1) * this.page.pageSize
        const data = this.data.slice(start, start + this.page.pageSize)
        this.tableData = data
        this.page.total = this.data.length
        this.asyncPageCurrent = this.page.current
        return void(0)
      }
      this.innerLoading = true
      this.errMsg = undefined
      this.pageRequest(this.page, this.theForm.attrs.model).then(res => {
        const { data, total, current } = res || {}
        this.tableData = data || []
        this.page.total = total || 0
        this.asyncPageCurrent = current || this.page.current
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
      this.page.current = 1
      this.getList()
    },
    // 表格刷新
    handleRefresh () {
      this.getList()
    },
    // 表格重置
    handleReset ({ callback, reset, search }) {
      if (this.$listeners['search-reset']) {
        this.$emit('search-reset', callback, reset, search)
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
    th {
      background-color: $--color-border-extralight;
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
        height: 48px;
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
    .ea-table__footer-right {
      margin-left: auto;
      padding-right: 0;
    }
    > * {
      margin-top: 12px;
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

<template>
<div class="ea-table">
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
  <slot name="table" :data="data">
    <div v-loading="loading === undefined ? innerLoading : loading">
      <el-table
        ref="table"
        :class="{'is-dense': dense}"
        :data="data"
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
          v-bind="{ label: '序号', align: 'center', fixed: true, width: 50 + Math.ceil((String(page.current).length - 1) * 7), ...theIndex.attrs }"
          type="index">
          <template #default="{$index}">
            {{ (asyncPageCurrent - 1) * page.pageSize + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="theSelection.show"
          v-bind="{ align: 'center', fixed: true, ...theSelection.attrs }"
          type="selection" />
        <el-table-column
          v-for="item in rawColumn.filter(m => m.show !== false)"
          :key="item.key"
          :label="item.label"
          :prop="item.prop"
          v-bind="item.bind"
          v-on="item.on">
          <template v-if="item.bind.render" #default="{row, column}">
            <component :is="generateRender(row, item, column)" />
          </template>
        </el-table-column>
        <el-table-column
          v-if="theOperation.show"
          v-bind="{ label: '操作', align: 'center', fixed: 'right', ...theOperation.attrs }">
          <template #default="scope">
            <slot name="row-menu" v-bind="scope" />
          </template>
        </el-table-column>
        <slot name="after-column" />
        <template #empty>
          <slot name="empty" />
        </template>
      </el-table>
    </div>
  </slot>
  <div class="ea-table__footer">
    <slot name="bottom-menu" />
    <el-pagination
      v-if="thePagination.show && page.total"
      class="ea-table__footer-right"
      layout="total, sizes, prev, pager, next, jumper"
      :page-size="page.pageSize"
      :current-page="page.current"
      :total="page.total"
      :page-sizes="[10, 20, 50, 100]"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </div>
</div>
</template>

<script>
import SearchBar from './SearchBar.vue'
import { columnMenu, middleRender } from './theader'
import { uuid } from '../util'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isArray'
import cloneDeep from 'lodash/cloneDeep'
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

    // inner to the
    const i_common =  (innerValue, callback = (e => e)) => {
      if (isPlainObject(innerValue)) return {
        show: innerValue.show !== false,
        attrs: callback(innerValue)
      }
      return { show: Boolean(innerValue) }
    }
    const thePagination = i_common(this.innerPagination)
    const theOperation = i_common(this.innerOperation)
    if (this.innerOperation === undefined) theOperation.show = true
    const theIndex = i_common(this.innerIndex)
    const theSelection = i_common(this.innerSelection)

    // local page
    let originalData = []
    if (this.pageRequest) {
      this.data.splice(0)
    } else {
      originalData = cloneDeep(this.data)
      this.data.splice(page.pageSize)
      page.total = originalData.length
    }
    return {
      rawColumn: [],
      theIndex,
      theSelection,
      thePagination,
      theOperation,
      columnMenu,
      innerLoading: false,
      errMsg: undefined,
      asyncPageCurrent: 1,
      page,
      originalData,
      searchForm: {}
    }
  },
  computed: {
    theForm () {
      if (!isPlainObject(this.innerForm)) return {
        show: Boolean(this.innerForm),
        attrs: {
          model: {}
        }
      }
      return {
        show: this.innerForm.show !== false,
        attrs: {
          column: [],
          model: this.searchForm,
          ...this.innerForm
        }
      }
    }
  },
  watch: {
    column: {
      immediate: true,
      handler (n) {
        this.columnWatcher(n)
      }
    }
  },
  mounted () {
    this.initRequest && this.handleSearch()
    const showAction = () => {
      try {
        let a = this.$slots['row-menu']
        let b = this.$scopedSlots['row-menu']
        a = Array.isArray(a) ? a : (a && a()) || []
        b = Array.isArray(b) ? b : (b && b()) || []
        return [...a, ...b].some(m => m.tag)
      } catch {
        return true
      }
    }
    if (this.innerOperation === undefined) {
      this.theOperation.show = showAction()
    }
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
              hideRefresh: () => this.hideRefresh()
            }
          )
        }
      }
    },
    getList () {
      if (!this.pageRequest) {
        const start = (this.page.current - 1) * this.page.pageSize
        const data = this.originalData.slice(start, start + this.page.pageSize)
        this.data.splice(0, this.data.length, ...data)
        this.asyncPageCurrent = this.page.current
        return void(0)
      }
      this.innerLoading = true
      this.errMsg = undefined
      this.pageRequest(this.page, this.theForm.attrs.model).then(res => {
        const { data, total, current } = res || {}
        this.data.splice(0, this.data.length, ...data)
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
      if (this.data.length <= 0) return void(0)
      const [one] = this.data.splice(0, 1)
      this.$nextTick(() => this.data.unshift(one))
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
    handleReset (callback) {
      if (this.$listeners['search-reset']) {
        this.$emit('search-reset', callback)
      } else {
        callback && callback()
      }
    },
    // 表格清空
    handleClear () {
      this.data.splice(0)
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
    }
    td, th {
      .cell {
        line-height: 1.2;
      }
    }
    &.is-dense {
      td, th {
        height: 32px;
        padding: 2px 0;
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
}

// table - popover
.el-popover.ea-popover-no-padding {
  padding: 8px 0;
  min-width: 100px;
}
</style>

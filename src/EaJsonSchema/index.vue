<template>
<div class="vjs-table">
  <div class="vjs-row odd vjs-header" :style="{minWidth: endWidth + 'px', left: headerLeft + 'px'}">
    <span
      v-for="(m, i) in column"
      :key="i"
      :class="{'vjs-cell': 1, 'vjs-cell-flex': m.flex }"
      :style="{width: m.width + 'px', ...(i === 0 && { paddingLeft: 20 + (checkbox ? 20 : 0) + 'px' })}">
      <span
        v-if="i === 0 && checkbox"
        class="vjs-checkbox"
        :style="{left: 20 + 'px'}">
        <el-checkbox
          v-model="globalChecked"
          :indeterminate="indeterminate"
          :disabled="disableCheckbox"
          @change="handleGlobalCheckChange" />
      </span>
      <component :is="{render: m.renderHeader}" v-if="m.renderHeader" />
      <span v-else>{{ m.label }}</span>
    </span>
    <span class="vjs-cell" />
  </div>
  <EaScrollbar class="vjs-body" :style="{height: endHeight + 'px'}">
    <EaVirtualScroll
      ref="evs"
      :enable-virtual-scroll="true"
      :options="list"
      :item-size="itemSize"
      @scroll-recalc="handleScrollRecalc">
      <div
        v-show="Object.values(item.__state.show).every(Boolean)"
        slot="item"
        slot-scope="{item, index}"
        :style="{minWidth: endWidth + 'px'}"
        :class="{'vjs-row': 1, 'odd': index % 2}">
        <i
          v-if="item.__state.hasChildren"
          :class="{
            'vjs-icon': 1,
            ['el-icon-caret-' + ['right', 'bottom'][Number(item.__state.isExpanded)]]: 1
          }"
          :style="{left: item.__state.level * 20 - 20 + 'px'}"
          @click="handleCollapse(item, index)" />
        <span
          v-if="item.__state.isTemp"
          class="vjs-cell vjs-temp"
          :style="{paddingLeft: item.__state.level * 20 + 'px'}">
          没有字段，立即
          <el-button type="text" size="medium" @click="handleTempAdd(item)">添加</el-button>
        </span>
        <template v-else>
          <span
            v-for="(m, i) in column"
            :key="i"
            :class="{
              'vjs-cell': 1,
              'vjs-cell-flex': m.flex,
              'error': item.__state.error[m.prop]
            }"
            :style="{
              width: m.width + 'px',
              ...(i === 0 && { paddingLeft: item.__state.level * 20 + (showCheckbox(item) ? 24 : 0) + 'px' })
            }">
            <span
              v-if="i === 0 && checkbox"
              class="vjs-checkbox"
              :style="{left: item.__state.level * 20 + 'px'}">
              <el-checkbox
                v-if="showCheckbox(item)"
                :key="item.__state.uuid"
                v-model="item.__state.checked"
                :indeterminate="item.__state.indeterminate"
                :disabled="disableCheckbox"
                @change="handleItemCheckChange($event, item)" />
            </span>
            <component
              :is="m.component"
              v-if="m.component"
              :key="item.__state.uuid + m.prop"
              v-model="item[m.prop]"
              v-bind="m.bind"
              :is-root="i === 0 && item.__state.isRoot"
              :is-tag="i === 0 && item.__state.virtualArrayItems"
              :is-disabled="m.bind && m.bind.virtualArrayItemsDisabled && item.__state.virtualArrayItems"
              :allow-edit="allowEdit"
              :row="item"
              @input="handleInput(item, m.prop)" />
            <span v-else>{{ item[m.prop] }}</span>
          </span>
          <span class="vjs-cell">
            <CellAction
              :key="item.__state.actionKey"
              :row="item"
              :allow-edit="allowEdit"
              @edit="handleRowEdit($event, item, index)" />
          </span>
        </template>
      </div>
    </EaVirtualScroll>
  </EaScrollbar>
</div>
</template>

<script>
import { uuid as createUUID } from '@/util'
import { column as rawColumn, ItemState, translateSchema, translateList, getRange, prefixToRealPath, prefixToDataPath } from './util'
import { translateSelection, getSubNodes, isContinuousPath, setItemChecked } from './selection'
import { cloneDeep } from 'lodash-es'
import CellAction from './CellAction.vue'
import AdvancedConf from './AdvancedConf.vue'
import EaScrollbar from '../EaScrollbar'
import EaVirtualScroll from '../EaSelect/VirtualScroll.vue'
export default {
  components: { EaScrollbar, EaVirtualScroll, CellAction },
  props: {
    value: { type: Object, default: () => ({}), required: true },
    height: { type: [Number, String], default: 'auto' },
    maxHeight: { type: Number, default: 400 },
    itemSize: { type: Number, default: 32 },
    allowEdit: { type: Boolean, default: true },
    checkbox: { type: Boolean, default: false },
    disableCheckbox: { type: Boolean, default: false },
    columnFormat: { type: Function, default: e => e },
    rootAlias: { type: String, default: 'root' }
  },
  emits: ['input', 'selection-change'],
  data () {
    // 当前显示的数据（为折叠服务）
    const list = translateSchema(this.value, this.rootAlias)
    // 背后的真实数据（全数据）
    const rawList = [...list]
    // 列信息
    const column = this.columnFormat(cloneDeep(rawColumn))
    return {
      column,
      rawList,
      list,
      headerLeft: 0,
      showAdvancedConfRow: undefined,
      globalChecked: false,
      indeterminate: false
    }
  },
  computed: {
    endWidth () {
      return this.column.reduce((acc, item) => {
        return acc += (item.flex ? 100 : item.width)
      }, 0) + 16
    },
    endHeight () {
      if (typeof this.height === 'number') return this.height
      return Math.min(this.maxHeight, this.list.length * this.itemSize)
    }
  },
  methods: {
    // 同步更新（将rawList的更新，同步至list上）
    syncUpdate () {
      this.list = this.rawList.filter(m => {
        return Object.values(m.__state.show).every(Boolean)
      })
    },
    // 展开 & 收起
    handleCollapse (item) {
      const ind = this.rawList.findIndex(m => m.__state.prefix === item.__state.prefix)
      const found = this.rawList[ind]
      const range = getRange(found, ind, this.rawList)

      if (item.__state.isExpanded) {
        found.__state.isExpanded = false
        this.rawList.slice(range[0], range[1]).forEach(m => {
          m.__state.show[item.__state.prefix] = false
        })
      } else {
        found.__state.isExpanded = true
        this.rawList.slice(range[0], range[1]).forEach(m => {
          m.__state.show[item.__state.prefix] = true
        })
      }
      this.syncUpdate()
    },
    // 用户输入
    handleInput (item, prop) {
      if (prop === 'type') {
        const ind = this.rawList.findIndex(m => m.__state.prefix === item.__state.prefix)
        const found = this.rawList[ind]
        if (found) {
          const range = getRange(found, ind, this.rawList)
          const uuid = createUUID()
          // (1) 修改为对象时
          if (item.type === 'object') {
            const prefix = item.__state.prefix + '.' + uuid
            const level = item.__state.level + 1
            const state = new ItemState(level, uuid, prefix, item.__state.parent)
            state.isTemp = true
            found.__state.hasChildren = true
            found.__state.isExpanded = true
            this.rawList.splice(ind + 1, range[1] - range[0], { type: 'string', __state: state })
          }
          // (2) 修改为数组时
          else if (item.type === 'array') {
            const prefix = item.__state.prefix + '.' + uuid
            const level = item.__state.level + 1
            const state = new ItemState(level, uuid, prefix, item.__state.parent)
            found.__state.hasChildren = true
            found.__state.isExpanded = true
            state.virtualArrayItems = true
            this.rawList.splice(ind + 1, range[1] - range[0], { prop: 'items', type: 'string', __state: state })
          }
          // (3) 修改项 的类型不为 object|array，但它可能有包含其它项(以前是object|array)
          else {
            item.__state.hasChildren = false
            this.rawList.splice(ind + 1, range[1] - range[0])
          }
          this.syncUpdate()
        }
      }
      // 无论如何
      this.schemaChange()
    },
    // 从临时行添加一行
    handleTempAdd (item) {
      item.__state.isTemp = false
      this.schemaChange()
    },
    // 添加相邻节点，子节点，删除节点，高级配置
    handleRowEdit ({ type, evt }, item, index) {
      const ind = this.rawList.findIndex(m => m.__state.prefix === item.__state.prefix)
      const found = this.rawList[ind]
      if (!found) return void(0)

      const uuid = createUUID()
      let lastIndex = ind + 1
      if (found.__state.hasChildren) {
        const range = getRange(found, ind, this.rawList)
        lastIndex = range[1]
      }
      // 添加相邻节点
      if (type === 'next') {
        const prefix = item.__state.prefix.replace(/([^.]+)$/, uuid)
        const level = item.__state.level
        this.rawList.splice(lastIndex, 0, { type: 'string', __state: new ItemState(level, uuid, prefix, item.__state.parent) })
        this.schemaChange()
      }
      // 添加子节点
      else if (type === 'sub') {
        const prefix = item.__state.prefix + '.' + uuid
        const level = item.__state.level + 1
        const nextNode = this.rawList[ind + 1]
        if (nextNode && nextNode.__state.isTemp) {
          nextNode.__state.isTemp = false
        } else {
          if (item.__state.isExpanded === false) this.handleCollapse(item)
          item.__state.hasChildren = true
          item.__state.isExpanded = true
          this.rawList.splice(lastIndex, 0, { type: 'string', __state: new ItemState(level, uuid, prefix, item) })
        }
        this.schemaChange()
      }
      // 删除节点
      else if (type === 'remove') {
        const num = lastIndex - ind
        this.rawList.splice(ind, num)
        this.schemaChange()
      }
      // 高级配置
      else if (type === 'conf') {
        evt.stopPropagation()
        this.$asyncLoad(() => import('../EaPopover'), {
          attrs: { popperClass: 'ea-popover-no-margin', placement: 'right' },
          props: { reference: evt.target },
          scopedSlots: {
            default: ({ close }) => {
              this.showAdvancedConfRow = { row: item, index, close }
              return this.$createElement(AdvancedConf, {
                props: { row: item },
                on: {
                  done: form => {
                    Object.assign(item, form)
                    item.__state.actionKey = createUUID()
                    this.showAdvancedConfRow = undefined
                    this.schemaChange()
                  }
                }
              })
            }
          }
        })
      }

      this.syncUpdate()
    },
    // 滚动计算事件节点 滚动时每100毫秒执行一次
    handleScrollRecalc ({ container }) {
      this.headerLeft = - container.scrollLeft
      if (!this.showAdvancedConfRow) return void(0)
      this.showAdvancedConfRow.close()
    },
    // 是否显示checkbox
    showCheckbox (item) {
      return this.checkbox && !(
        item.__state.isRoot
        || item.__state.isTemp
        || item.__state.virtualArrayItems
      )
    },
    // 操作全选按钮
    handleGlobalCheckChange (evt) {
      this.indeterminate = false
      this.rawList.forEach(item => {
        if (
          item.__state.isRoot
          || item.__state.virtualArrayItems
          || item.__state.isTemp
        ) return void(0)
        if (item.__state.checked === evt) return void(0)
        item.__state.indeterminate = false
        item.__state.checked = evt
        const _item = translateSelection([item], this.rawList)[0]
        this.$emit('selection-change', _item)
      })
      this.syncUpdate()
    },
    // 操作单选
    handleItemCheckChange (evt, item) {
      setItemChecked(this, item, evt, this.rawList)
      this.syncUpdate()
      const _item = translateSelection([item], this.rawList)[0]
      this.$emit('selection-change', _item)
    },
    // json-schema changed
    schemaChange () {
      this.$emit('input', this.getData())
    },
    // expose 1 校验，基本校验prop不能为空
    validate () {
      // TODO: 同时应定位到验证失败的项
      return this.rawList.every(m => m.prop !== undefined)
    },
    // expose 2 获取最终数据
    getData () {
      return translateList(this.rawList)
    },
    // expose 3 获取选中的节点数据 containIndeterminate 是否包含半选
    getChecked (containIndeterminate) {
      const selectedRows = this.rawList.filter(item => {
        return !(
          item.__state.isRoot
          || item.__state.virtualArrayItems
          || item.__state.isTemp
        ) && (
          item.__state.checked
          || (containIndeterminate ? item.__state.indeterminate : false)
        )
      })
      return translateSelection(selectedRows, this.rawList)
    },
    // expose 4 设置选中的节点 force 是否强制设置（反之仅设置符合关联关系的节点）
    setChecked (paths, force = false) {
      const mapping = this.rawList.filter(m => !m.__state.isTemp).reduce((pacc, item) => {
        const realPrefix = item.__state.prefix.split('.').reduce((acc, m) => {
          const found = this.rawList.find(n => n.__state.uuid === m)
          acc.push(found.prop)
          if (found.type === 'object') acc.push('properties')
          return acc
        }, [])
        if (realPrefix[realPrefix.length - 1] === 'properties') {
          realPrefix.pop()
        }
        realPrefix.shift()
        if (!realPrefix.length) return pacc
        pacc[realPrefix.join('.')] = item
        return pacc
      }, {})

      if (force) {
        paths.forEach(path => {
          const item = mapping[path]
          this.handleItemCheckChange(true, item)
        })
      } else {
        // 过滤为连续的项（符合关联关系的，只设置叶子节点）
        const continuousPaths = paths.filter(m => isContinuousPath(m, paths))
        const continuousList = continuousPaths.map(m => mapping[m])
        continuousList.filter(m => {
          if (m.type === 'array') {
            if (getSubNodes(m, this.rawList).length <= 1) return true
          }
          return !m.__state.hasChildren
        }).forEach(item => {
          this.handleItemCheckChange(true, item)
        })
      }
    },
    // expose 5 转换prefix为真实的schema路径
    getSchemaPath (prefix) {
      return prefixToRealPath(prefix, this.rawList)
    },
    // expose 6 转换prefix为真实的data路径
    getDataPath (prefix) {
      return prefixToDataPath(prefix, this.rawList)
    }
  }
}
</script>

<style lang="scss">
.vjs-table {
  position: relative;
  overflow: hidden;
}
.vjs-header {
  position: absolute;
  top: 0;
  border: 1px solid $--color-border-light;
  border-bottom: 0;
}
.vjs-body {
  border: 1px solid $--color-border-light;
}

.vjs-row {
  height: 32px;
  line-height: 32px;
  display: flex;
  justify-content: flex-start;
  position: relative;
  &.odd { background-color: #F8F8F8; }
  &:not(.vjs-header):hover { background-color: #EBEEF5; }
  .vjs-cell {
    flex: 0 0 auto;
    height: 100%;
    font-size: 14px;
    box-sizing: border-box;
    padding: 0 8px;
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
    & > .el-tag {
      vertical-align: 1px;
    }
    &.vjs-cell-flex {
      flex-grow: 1;
    }
    &.error {
      border: 1px solid red;
    }
    & > .vjs-checkbox {
      position: absolute;
      top: 0;
    }
  }
  .vjs-icon {
    cursor: pointer;
    position: absolute;
    height: 100%;
    color: #CCC;
    display: flex;
    align-items: center;
    z-index: 1;
    &:hover {
      color: #333;
    }
  }
  .vjs-temp {
    color: #909399;
  }
}

.vjs-checkbox .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: $--color-secondary-text;
  border-color: $--color-secondary-text;
}

.cell-text {
  height: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-break: break-all;
  .cell-placeholder {
    color: #C0C4CC;
  }
}

.cell-input {
  display: block;
  height: 30px;
  line-height: 30px;
  font-size: inherit;
  color: inherit;
  font-family: inherit;
  margin-left: -4.7px;
  .el-input__inner {
    border-radius: 0;
    font-size: inherit;
    color: inherit;
    font-family: inherit;
    padding-left: 4px;
  }
}

.cell-select {
  cursor: pointer;
  &:not(.is-disabled):hover {
    border-width: 0;
    border-bottom-width: 1.5px;
    border-style: solid;
  }
  &.is-disabled {
    cursor: default;
  }
}

.cell-required {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  .box {
    width: 20px;
    height: 20px;
    box-sizing: border-box;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 4px;
    color: #DDD;
    background-color: rgba(0, 0, 0, 0.02);
    &:not(.is-disabled):hover {
      color: #999;
      background-color: rgba(0, 0, 0, 0.05);
    }
    &.is-disabled {
      cursor: default;
      color: transparent;
      background-color: transparent;
    }
    &.is-required, &.is-required:hover {
      color: red;
      background-color: rgba(0, 0, 0, 0.08);
    }
  }
}

.cell-action {
  width: 80px;
  i {
    cursor: pointer;
    font-size: 16px;
    padding: 4px;
    border-radius: 4px;
    &:hover {
      background-color: rgba(0,0,0,0.1);
    }
  }
}
.action-popover {
  margin: 0 !important;
}

.ea-blue {
  color: #409EFF;
}
.ea-purple {
  color: #EE46BC !important;
}
.ea-success {
  color: $--color-success;
}
.ea-danger {
  color: $--color-danger;
}
.ea-info {
  color: $--color-info;
}
.ea-placeholder {
  color: $--color-placeholder-text !important;
}

.ea-popover-no-margin {
  margin: 0 !important;
}

@font-face {
  font-family: 'eafont';
  src: url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAQYAAsAAAAACMAAAAPLAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDHAqFDIRVATYCJAMQCwoABCAFhE8HQBu9BxEVnLHIfibwpknuXkitybkhDKpb3+RDeb1vMhOsa34zn2ST3rpbnaQ7jZOwi3OelIhQI3mLHn0haTkDFEZf6SdAAFkA/M/ltDHxABvfAoC7xti0t5dlvehe2rbAxhiUbfFAIsy8BXYOdTBB14AA0MJNMC4yOjETxsayzmZMwiDhCeDmksa6mjJIdwNYCkIgqYW8KxnIUvAAt4C7BGCJ+XnyER5JAAeeQtontTqqEsfe4I0bVawK6CPoOBDgaA4AD4ACcOqZidSmO8pB7bATCm1ckMEHOCiBA2ptM75xs1pZNCqFJDsBrvSfRwRICj1SvSIUeAOVBxzwxiiIU7qhaAUUTF8hARgJuAwQV0iaKfUsFCCNNxhGG7SjtYaxY4lGRgbuZDNvZTJvZzHv5riIWmmOGkzUuxFVl27lVB+9q7OkJEK51XPw7m2JcOs9dwL05isn1JNXdWXmfZuUzfstB7eqWw5k6s2HlMM6wyq1Ur1793aQwXL5uHLsklZ/6NadO2U+61H1yA23UsnOr6+wtChXH3JzL0iKIqt5uRoraFeuoKtaqxwuXs18qMz+If6j7B2qsiLTw2vHNIy5EZqYFJ8wvXp6reO9qIzItHL7SvuHY/ODcgM9ijxLm3N3HC3PcEt1dU11yygPdexWfv+Wuh0fmn/+fNVmI0fPkm3aUP9WzjNlTw6OGJcrozrKqO8IucXmW0liyTebp7aTH2z22fzAhy47ZeszcZbHrIk+a4L33vHyySlyqtG1ZtO2tHrQABahETOU7ZxfsjesIuV4ZLq7Z3rkXFJQo3Ome47HpVDPqpj+GrkyMLBSrvlKKHWuDKyRv1Ja3NHQyZE+ckXTJKc/WgEA1hN0Fw03WR/pMjpOe4ySKuya+Q6+fCl7UmKSv0k6BgB4ydgfclmPMZQTHnNhbsEVoizMWZJ9PQBjcRJVdNU5MiHdgxwArWwGLok4MMqTOlSjORsgEDDaBQ4iJgKFgBlERrUBHjo4yQRZ5YughaOg9TqMVgsKwjQAbAwAeAi9jcAx2gyU3kEio54F3jg/EOi9B63s/246NiVcehQjapAbOMWZFPuIQs98opmi6D1CHPXFfnCcoS6qQOyBGfuiC4bZNONIQD0nuBc4K0aGtmePaizsOLbnsqS4mxSK0+7SoxhRA7kBpziTzo/XCHfcE80URbmiOYjfcD847g5qhSqV+FBkKtjy/GE2jXEkQJ98TuDeiizKYQZt/DCPaizYEsH2rKRSlFdRjEmVNmkNgJZ0EIsjlDDCQ9oNQkbUp1VJPSXucbcDAA==') format('woff2');
}
.eafont {
  font-family: eafont;
  font-style: normal;
  font-size: 16px;
  color: #909399;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.ea-icon-disabled:before { content: "\e630" }
.ea-icon-conf:before { content: "\e600" }
.ea-icon-more:before { content: "\e60e" }
.eafont.ea-icon-conf.has { color: #000 }
</style>

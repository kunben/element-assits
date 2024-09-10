<template>
<div class="vjs-table">
  <div class="vjs-row odd vjs-header">
    <span
      v-for="(m, i) in column"
      :key="i"
      class="vjs-cell"
      :style="{width: m.width + 'px', ...(i === 0 && { paddingLeft: '20px' })}">
      <component :is="{render: m.renderHeader}" v-if="m.renderHeader" />
      <span v-else>{{ m.label }}</span>
    </span>
    <span class="vjs-cell" />
  </div>
  <EaScrollbar class="vjs-body" :style="{height: height + 'px'}">
    <EaVirtualScroll
      ref="evs"
      :enable-virtual-scroll="true"
      :options="list"
      :item-size="32"
      @scroll-recalc="handleScrollRecalc">
      <div
        v-show="Object.values(item.__state.show).every(Boolean)"
        slot="item"
        slot-scope="{item, index}"
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
              'vjs-last-cell': i === (column.length - 1),
              'error': item.__state.error[m.prop]
            }"
            :style="{
              width: m.width + 'px',
              ...(i === 0 && { paddingLeft: item.__state.level * 20 + 'px' })
            }">
            <component
              :is="m.component"
              v-if="m.component"
              v-model="item[m.prop]"
              v-bind="m.bind"
              :is-root="i === 0 && item.__state.isRoot"
              :is-tag="i === 0 && item.__state.virtualArrayItems"
              :is-disabled="m.bind && m.bind.virtualArrayItemsDisabled && item.__state.virtualArrayItems"
              :row="item"
              @input="handleInput(item, m.prop)" />
            <span v-else>{{ item[m.prop] }}</span>
          </span>
          <span class="vjs-cell">
            <CellAction
              :key="item.__state.uuid"
              :row="item"
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
import { column, ItemState, translateSchema, translateList, getRange } from './util'
import CellAction from './CellAction.vue'
import AdvancedConf from './AdvancedConf.vue'
import EaScrollbar from '../EaScrollbar'
import EaVirtualScroll from '../EaSelect/VirtualScroll.vue'
export default {
  components: { EaScrollbar, EaVirtualScroll, CellAction },
  props: {
    value: { type: Object, required: true },
    height: { type: Number, default: 500 },
    allowEdit: { type: Boolean, default: true }
  },
  data () {
    // 当前显示的数据（为折叠服务）
    const list = translateSchema(this.value)
    // 背后的真实数据（全数据）
    const rawList = [...list]
    return {
      column,
      rawList,
      list,
      showAdvancedConfRow: undefined
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
            const state = new ItemState(level, uuid, prefix)
            state.isTemp = true
            found.__state.hasChildren = true
            found.__state.isExpanded = true
            this.rawList.splice(ind + 1, range[1] - range[0], { type: 'string', __state: state })
          }
          // (2) 修改为数组时
          else if (item.type === 'array') {
            const prefix = item.__state.prefix + '.' + uuid
            const level = item.__state.level + 1
            const state = new ItemState(level, uuid, prefix)
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
        this.rawList.splice(lastIndex, 0, { type: 'string', __state: new ItemState(level, uuid, prefix) })
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
          this.rawList.splice(lastIndex, 0, { type: 'string', __state: new ItemState(level, uuid, prefix) })
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
                    const uuid = createUUID()
                    item.__state.prefix = item.__state.prefix.replace(item.__state.uuid, uuid)
                    item.__state.uuid = uuid
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
    handleScrollRecalc () {
      if (!this.showAdvancedConfRow) return void(0)
      this.showAdvancedConfRow.close()
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
    }
  }
}
</script>

<style lang="scss">
.vjs-table {
  position: relative;
  overflow: hidden;
  border: 1px solid #DDD;
}
.vjs-header {
  position: absolute;
  top: 0;
  left: 0;
  border-bottom: 1px solid #EEE;
}
.vjs-body {
  height: 400px;
}

.vjs-row {
  height: 32px;
  line-height: 32px;
  display: flex;
  justify-content: flex-start;
  position: relative;
  &.odd { background-color: #F8F8F8; }
  &:hover { background-color: #EBEEF5; }
  .vjs-cell {
    flex: 0 0 auto;
    height: 100%;
    font-size: 14px;
    box-sizing: border-box;
    padding: 0 8px;
    &.vjs-last-cell {
      flex-grow: 1;
    }
    &.error {
      border: 1px solid red;
    }
  }
  .vjs-icon {
    cursor: pointer;
    position: absolute;
    height: 100%;
    color: #CCC;
    display: flex;
    align-items: center;
    &:hover {
      color: #333;
    }
  }
  .vjs-temp {
    color: #909399;
  }
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
  &:hover {
    border-width: 0;
    border-bottom-width: 1.5px;
    border-style: solid;
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
    &:hover {
      color: #999;
      background-color: rgba(0, 0, 0, 0.05);
    }
    &.is-required {
      color: red;
      background-color: rgba(0, 0, 0, 0.08);
    }
  }
}

.cell-action {
  width: 80px;
  i {
    cursor: pointer;
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
  color: #909399;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.ea-icon-disabled:before { content: "\e630" }
.ea-icon-conf:before { content: "\e600" }
.ea-icon-more:before { content: "\e60e" }
.eafont.ea-icon-conf.has { color: #000 }
</style>

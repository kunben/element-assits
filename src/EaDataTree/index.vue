<template>
<EaScrollbar
  :class="{'ea-data-tree-body': 1, 'ea-data-tree-body__border': border}"
  :style="{height: endHeight + 'px'}">
  <EaVirtualScroll
    :enable-virtual-scroll="true"
    :options="list.filter(m => Object.values(m.__state.show).every(Boolean))"
    :item-size="itemSize"
    :redundancy="redundancy">
    <div
      slot="item"
      slot-scope="{item, index}"
      :style="{height: itemSize + 'px', lineHeight: itemSize + 'px'}"
      :class="{'ea-data-tree-row': 1, 'odd': stripe && index % 2}">
      <i
        v-if="item.__state.hasChildren"
        :class="{
          'ea-data-tree-icon': 1,
          [calcExpandIcon(item)]: 1
        }"
        :style="{left: item.__state.level * 20 + 'px'}"
        @click="handleCollapse(item, index)" />
      <span
        class="ea-data-tree-cell"
        :style="{ paddingLeft: item.__state.level * 20 + (checkbox ? 24 : 0) + 'px' }">
        <span
          v-if="checkbox"
          class="ea-data-tree-checkbox"
          :style="{left: item.__state.level * 20 + 'px'}">
          <el-checkbox
            v-if="checkbox"
            :key="item.__state.uuid"
            v-model="item.__state.checked"
            :indeterminate="item.__state.indeterminate"
            :disabled="disableCheckbox"
            @change="handleItemCheckChange($event, item)" />
        </span>
        <slot name="default" :item="item" :index="index">
          <span>{{ item[endProps.label] }}</span>
        </slot>
      </span>
      <slot name="row" :item="item" :index="index" />
    </div>
  </EaVirtualScroll>
  <div
    v-if="!list || !list.length"
    class="ea-data-tree-empty"
    :style="{height: endHeight + 'px'}">
    {{ noDataText }}
  </div>
</EaScrollbar>
</template>

<script>
import EaScrollbar from '../EaScrollbar'
import EaVirtualScroll from '../EaSelect/VirtualScroll.vue'
import { translateTree, getRange, setItemChecked } from './util'
import { recursive, recursiveFilter } from '@/util'
import { cloneDeep } from 'lodash-es'
export default {
  components: { EaScrollbar, EaVirtualScroll },
  props: {
    data: { type: Array, default: () => ([]), required: true },
    height: { type: [Number, String], default: 'auto' },
    border: { type: Boolean, default: false },
    stripe: { type: Boolean, default: false },
    maxHeight: { type: Number, default: 500 },
    itemSize: { type: Number, default: 32 },
    redundancy: { type: Number, default: 60 },
    checkbox: { type: Boolean, default: false },
    props: { type: Object, default: undefined },
    disableCheckbox: { type: Boolean, default: false },
    noDataText: { type: String, default: '暂无数据' },
    loadMethod: { type: Function, default: () => Promise.resolve() },
    rowKey: { type: String, default: undefined }
  },
  emits: ['selection-change', 'expand', 'expanded'],
  data () {
    return {
      rawList: [],
      list: []
    }
  },
  computed: {
    endProps () {
      return {
        label: 'label',
        value: 'value',
        children: 'children',
        ...this.props
      }
    },
    endHeight () {
      if (typeof this.height === 'number') return this.height
      return Math.min(this.maxHeight, (this.list.length || 3) * this.itemSize)
    }
  },
  watch: {
    data: {
      immediate: true,
      handler (n) {
        this.dataWatcher(n)
      }
    }
  },
  methods: {
    // 同步更新（将rawList的更新，同步至list上）
    syncUpdate () {
      this.list = this.rawList.filter(m => {
        return Object.values(m.__state.show).every(Boolean)
      })
    },
    dataWatcher (n, o, inheritCk = false) {
      const temp = translateTree(n, this.endProps)
      // 当前显示的数据（为折叠服务）
      this.list = temp
      // 背后的真实数据（全数据）
      const oldRawList = [...this.rawList]
      const oldRawListMapping = oldRawList.reduce((acc, m) => {
        acc[m.__uuid] = m
        return acc
      }, {})
      const newRawList = [...temp]

      newRawList.forEach(item => {
        const oldItem = oldRawListMapping[item.__uuid]
        if (oldItem) {
          item.__state.inherit(oldItem.__state)
        } else {
          item.__state.inheritShow()
          inheritCk && item.__state.inheritChecked()
        }
      })

      this.rawList = newRawList
      this.syncUpdate()
    },
    filter (keyword, callback) {
      const rowKey = this.rowKey || this.endProps.value
      callback = callback || (m => {
        if (!keyword) return true
        return m[this.endProps.label].indexOf(keyword) > -1
      })
      const cloneData = cloneDeep(this.data)
      const d = recursiveFilter(cloneData, m => callback(m))
      const keys = []
      recursive(d, m => keys.push(m[rowKey]))
      this.rawList.forEach(item => {
        if (!keys.includes(item[rowKey])) {
          item.__state.show['filter'] = false
        } else {
          item.__state.show['filter'] = true
        }
      })
      this.syncUpdate()
    },
    // 展开 & 收起
    async handleCollapse (item) {
      this.$emit('expand', item)
      const ind = this.rawList.findIndex(m => m.__state.uuidPath === item.__state.uuidPath)
      const found = this.rawList[ind]
      const range = getRange(found, ind, this.rawList)

      if (item.__state.isExpanded) {
        // 收起
        found.__state.isExpanded = false
        this.rawList.slice(range[0], range[1]).forEach(m => {
          m.__state.show[item.__state.level] = false
        })
        this.syncUpdate()
        this.$emit('expanded', { state: false, node: found })
        return found
      } else {
        // 展开
        if (found.__state.expandLoaded) {
          // 已经展开加载过了，直接展开
          found.__state.isExpanded = true
          this.rawList.slice(range[0], range[1]).forEach(m => {
            m.__state.show[item.__state.level] = true
          })
          this.syncUpdate()
          this.$emit('expanded', { state: true, node: found })
          return found
        } else {
          // 还未曾展开加载，执行加载方法
          found.__state.expandLoading = true
          return this.loadMethod(item).then(list => {
            if (!Array.isArray(list)) throw new Error('loadMethod doesn\'t receive an array')
            // (1) 修改data
            const uuidAttr = this.rowKey || this.endProps.value
            const childrenAttr = this.endProps.children

            let fd
            recursive(this.data, m => {
              if (m[uuidAttr] === item[uuidAttr]) {
                fd = m
                return false
              }
            }, this.endProps.children)

            fd[childrenAttr] = list
            // (2) 同步数据
            this.dataWatcher(this.data, null, true)
            // (3) 更正展开状态
            const _ind = this.rawList.findIndex(m => m[uuidAttr] === item[uuidAttr])
            const _found = this.rawList[_ind]
            const _range = getRange(_found, _ind, this.rawList)
            this.rawList.slice(_range[0], _range[1]).forEach(m => {
              m.__state.show[item.__state.level] = true
            })
            _found.__state.isExpanded = true
            _found.__state.expandLoading = false
            _found.__state.expandLoaded = true
            // (4) 同步渲染列表
            this.syncUpdate()
            this.$emit('expanded', { state: true, isAsync: true, node: _found, data: list })
            return _found
          }).catch(() => {
            found.__state.isExpanded = true
            found.__state.expandLoading = false
            found.__state.expandLoaded = true
            this.$emit('expanded', { state: true, isAsync: true, node: found, data: [] })
          })
        }
      }
    },
    // 操作单选
    handleItemCheckChange (evt, item) {
      setItemChecked(this, item, evt, this.rawList)
      this.syncUpdate()
      this.$emit('selection-change', item)
    },
    // expand-icon
    calcExpandIcon (item) {
      if (item.__state.expandLoading) return 'el-icon-loading'
      return 'el-icon-caret-' + ['right', 'bottom'][Number(item.__state.isExpanded)]
    },
    // 获取选中项
    getChecked (containIndeterminate) {
      return this.rawList.filter(m => {
        return m.__state.checked || (containIndeterminate && m.__state.indeterminate)
      })
    },
    // 设置选中的节点 force 是否强制设置（反之仅设置符合关联关系的节点）
    setChecked (data) {
      this.rawList.forEach(m => {
        m.__state.checked = false
        m.__state.indeterminate = false
      })
      const vttr = this.rowKey || this.endProps.value
      recursive(data, item => {
        const found = this.rawList.find(m => m[vttr] === item[vttr])
        if (found) found.__state.checked = true
      })
    },
    // 通过rowKey设置选中项
    setCheckedKeys (keys) {
      const uniqKey = this.rowKey || this.endProps.value
      const rawListMapping = this.rawList.reduce((acc, m) => {
        acc[m[uniqKey]] = m
        return acc
      }, {})
      keys.forEach(m => {
        setItemChecked(this, rawListMapping[m], true, this.rawList)
      })
    }
  }
}
</script>

<style lang="scss">
.ea-data-tree-body {
  &.ea-data-tree-body__border {
    border: 1px solid $--color-border-light;
  }
}

.ea-data-tree-row {
  display: flex;
  justify-content: flex-start;
  position: relative;
  padding-left: 20px;
  box-sizing: border-box;
  &.odd { background-color: #F8F8F8; }
  &:hover { background-color: #EBEEF5; }
  .ea-data-tree-cell {
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
    & > .ea-data-tree-checkbox {
      position: absolute;
      top: 0;
    }
  }
  .ea-data-tree-icon {
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
}

.ea-data-tree-checkbox .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: $--color-secondary-text;
  border-color: $--color-secondary-text;
}

.ea-data-tree-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  color: $--color-secondary-text;
}
</style>

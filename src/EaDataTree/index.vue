<template>
<EaScrollbar
  :class="{'ea-data-tree-body': 1, 'ea-data-tree-body__border': border}"
  :style="{height: endHeight + 'px'}">
  <EaVirtualScroll
    :enable-virtual-scroll="true"
    :options="list"
    :item-size="itemSize"
    :redundancy="redundancy">
    <div
      v-show="Object.values(item.__state.show).every(Boolean)"
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
import { recursive } from '@/util'
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
    loadMethod: { type: Function, default: () => Promise.resolve() }
  },
  emits: ['selection-change'],
  data () {
    const endProps = {
      label: 'label',
      value: 'value',
      children: 'children',
      uuid: '__uuid',
      ...this.props
    }
    // 当前显示的数据（为折叠服务）
    const list = translateTree(this.data, endProps)
    // 背后的真实数据（全数据）
    const rawList = [...list]
    return {
      rawList,
      list,
      endProps
    }
  },
  computed: {
    endHeight () {
      if (typeof this.height === 'number') return this.height
      return Math.min(this.maxHeight, (this.list.length || 3) * this.itemSize)
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
      } else {
        // 展开
        if (found.__state.expandLoaded) {
          // 已经展开加载过了，直接展开
          found.__state.isExpanded = true
          this.rawList.slice(range[0], range[1]).forEach(m => {
            m.__state.show[item.__state.level] = true
          })
          this.syncUpdate()
        } else {
          // 还未曾展开加载，执行加载方法
          found.__state.expandLoading = true
          this.loadMethod(item).then(list => {
            if (!Array.isArray(list)) throw new Error('loadMethod doesn\'t receive an array')
            // (1) 修改data
            const uuidAttr = this.endProps.uuid
            const childrenAttr = this.endProps.children

            // const fd = this.data.find(m => m[uuidAttr] === item[uuidAttr])
            let fd
            recursive(this.data, m => {
              if (m[uuidAttr] === item[uuidAttr]) {
                fd = m
                return false
              }
            }, this.endProps.children)

            fd[childrenAttr] = list
            // (2) 重置 rawList **并继承状态**
            const oldRawListMapping = this.rawList.reduce((acc, m) => {
              acc[m[uuidAttr]] = m
              return acc
            }, {})
            const newRawList = translateTree(this.data, this.endProps)
            newRawList.forEach(m => {
              if (oldRawListMapping[m[uuidAttr]]) {
                m.__state.inherit(oldRawListMapping[m[uuidAttr]].__state)
              }
            })
            this.rawList = newRawList
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
          }).finally(() => {
            found.__state.isExpanded = true
            found.__state.expandLoading = false
            found.__state.expandLoaded = true
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
    // expose 1 获取选中项
    getChecked (containIndeterminate) {
      return this.rawList.filter(m => {
        return m.__state.checked || (containIndeterminate && m.__state.indeterminate)
      })
    },
    // expose 2 设置选中的节点 force 是否强制设置（反之仅设置符合关联关系的节点）
    setChecked (data) {
      this.rawList.forEach(m => {
        m.__state.checked = false
        m.__state.indeterminate = false
      })
      const vttr = this.endProps.value
      recursive(data, item => {
        const found = this.rawList.find(m => m[vttr] === item[vttr])
        if (found) found.__state.checked = true
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

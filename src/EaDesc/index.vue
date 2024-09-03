<template>
<div class="ea-desc">
  <slot name="title">
    <div v-if="title" class="ea-desc__title">{{ title }}</div>
  </slot>
  <div class="ea-desc__list">
    <div
      v-for="m in initColumn"
      :key="m.prop"
      :class="{ 'item': 1, 'has-diff': m.__hasDiff, ...(m.bind && m.bind.class) }"
      :style="{...m.__style, ...(m.bind && m.bind.style)}">
      <div class="item-label" :style="{ width: rawLabelWidth }">{{ m.label }}</div>
      <div class="item-value" :style="{ marginLeft: rawLabelWidth }">
        <slot :name="m.prop" :row="data[m.prop]">
          <div v-if="m.render"><component :is="getComponent(m, data)" /></div>
          <div v-else :class="{ 'value-no-wrap': m.__isTooLength }">
            {{ data[m.prop] }}
            <span
              v-if="m.__isTooLength"
              class="click-see-more"
              @click="m.__isTooLength = false">查看更多</span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    title: { type: String, default: undefined },
    data: { type: Object, required: true },
    column: { type: Array, required: true },
    labelWidth: { type: [Number, String], default: 100 },
    split: { type: Number, default: 2 },
    diff: { type: Array, default: undefined },
    gutter: { type: Number, default: 0 }
  },
  data () {
    return {
      initColumn: []
    }
  },
  computed: {
    rawLabelWidth () {
      return typeof this.labelWidth === 'number'
        ? ( this.labelWidth + 'px' )
        : this.labelWidth
    }
  },
  watch: {
    column: {
      immediate: true,
      handler () {
        this.pushChange()
      }
    },
    data: {
      immediate: true,
      handler () {
        this.pushChange()
      }
    }
  },
  methods: {
    getComponent (column, data) {
      return {
        render: h => column.render(h, {
          row: data,
          column: column,
          value: data[column.prop]
        })
      }
    },
    getRatio (span) {
      span = Number(span)
      span = Number.isNaN(span) ? 0 : span
      return (100 * (span / 24)) || (100 / this.split)
    },
    pushChange () {
      const column = this.column || []
      const data = this.data || {}
      const diff = this.diff || []
      this.initColumn = column.map((item, ind) => {
        const itemGutter = ind % this.split !== 0 ? this.gutter : 0
        const itemExtend = (this.gutter * (this.split - 1)) / this.split
        return {
          ...item,
          __hasDiff: diff.includes(item.prop),
          __style: {
            'width': `calc(${this.getRatio(item.span)}% - ${itemExtend}px)`,
            'margin-left': `${itemGutter}px`
          },
          __isTooLength: String(data[item.prop]).length > 200
        }
      })
    }
  }
}
</script>

<style lang="scss">
.ea-desc {
  font-size: 14px;
  &__title {
    font-size: 16px;
    margin-bottom: 12px;
  }
  &__list {
    display: flex;
    flex-wrap: wrap;
  }
}
.ea-desc .item {
  line-height: 24px;
  margin-bottom: 10px;
  flex: 0 0 auto;
  .item-label {
    float: left;
    text-align: right;
    padding-right: 8px;
    color: #909399;
  }
  .item-value {
    word-break: break-all;
    overflow: hidden;
    .value-no-wrap {
      height: 48px;
      overflow: hidden;
      position: relative;
      .click-see-more {
        position: absolute;
        right: 0;
        bottom: 0;
        height: 24px;
        padding-left: 30px;
        padding-right: 4px;
        background-image: linear-gradient(to right, transparent 0%, #fff 20%, #fff 100%);
        cursor: pointer;
        color: $--color-primary;
        user-select: none;
      }
    }
  }
}
</style>

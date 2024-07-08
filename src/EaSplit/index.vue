<template>
<div
  ref="sc_container"
  :class="{'ea-split-container': 1, 'is-down': isDown }"
  @mousemove="handleMousemove"
  @mouseup="isDown = false"
  @mouseleave="isDown = false">
  <div class="sc-left" :style="{width: leftRate * 100 + '%'}">
    <slot name="left" />
  </div>
  <div class="sc-bamboo" @mousedown="handleMousedown">
    <slot name="center">
      <i v-for="m in 8" :key="m" class="sc-texture" />
    </slot>
  </div>
  <div class="sc-right" :style="{width: `calc(${(1 - leftRate) * 100}% - 40px)`}">
    <slot name="right" />
  </div>
</div>
</template>

<script>
export default {
  props: {
    default: { type: Number, default: 0.2 },
    min: { type: Number, default: 0.2 },
    max: { type: Number, default: 0.5 }
  },
  data () {
    const leftRate = this.default || 0.2
    return {
      isDown: false,
      domPageX: 0,
      domWidth: 0,
      leftRate
    }
  },
  mounted () {
    const scContainer = this.$refs.sc_container
    this.domPageX = getDomPageX(scContainer)
    this.domWidth = getDomWidth(scContainer)
  },
  methods: {
    handleMousedown (evt) {
      if (!evt || evt.buttons != 1) return null
      this.isDown = true
    },
    handleMousemove (evt) {
      if (!this.isDown) return null
      const relativeX = evt.pageX - this.domPageX
      this.leftRate = Math.min(Math.max(relativeX / this.domWidth, this.min), this.max)
    }
  }
}

function getDomPageX (dom) {
  getDomPageX.result = (getDomPageX.result || 0) + dom.offsetLeft
  if (dom.offsetParent) return getDomPageX(dom.offsetParent)
  const result = getDomPageX.result
  // 清空以迎接下一递归周期
  getDomPageX.result = undefined
  return result
}
function getDomWidth (dom) {
  const DOMRectIns = dom.getBoundingClientRect()
  return DOMRectIns && DOMRectIns.width || 0
}
</script>

<style lang="scss">
.ea-split-container {
  display: flex;
  &.is-down {
    user-select: none;
  }
  .sc-left {
    flex-grow: 1;
    flex-shrink: 1;
  }
  .sc-right {
    flex-grow: 1;
    flex-shrink: 1;
  }
  .sc-bamboo {
    flex-grow: 0;
    flex-shrink: 0;
    width: 8px;
    border: 1px solid #DCDEE2;
    border-top: none;
    border-bottom: none;
    background-color: #F8F8F9;
    cursor: col-resize;
    user-select: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 16px;
    .sc-texture {
      width: 4px;
      height: 1px;
      background: rgba(23, 35, 61, .25);
      margin-top: 3px;
    }
  }
}
</style>

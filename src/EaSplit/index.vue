<template>
<div
  ref="sc_container"
  :class="{'ea-split-container': 1, 'is-down': isDown }"
  @mousemove="handleMousemove"
  @mouseup="isDown = false"
  @mouseleave="isDown = false">
  <div class="sc-left" :style="{width: `calc(${leftRate * 100}% - ${centerWidth / 2}px)`}">
    <slot name="left" />
  </div>
  <template v-if="defaultAlias !== 1">
    <div ref="scc" class="sc-center">
      <div class="sc-bamboo" @mousedown="handleMousedown">
        <i v-for="m in 8" :key="m" class="sc-texture" />
      </div>
      <div v-if="$slots.center" class="sc-on-bamboo" @mousedown.stop>
        <slot name="center" />
      </div>
    </div>
    <div class="sc-right" :style="{width: `calc(${(1 - leftRate) * 100}% - ${centerWidth / 2}px)`}">
      <slot name="right" />
    </div>
  </template>
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
    return {
      isDown: false,
      domPageX: 0,
      domWidth: 0,
      leftRate: 0.2,
      defaultLeftRate: null,
      centerWidth: 0
    }
  },
  computed: {
    // 因为 default 不能直接用于模板，因此此处取别名
    defaultAlias () {
      return this.default
    }
  },
  watch: {
    // 允许 default 手动控制面板比例
    default: {
      immediate: true,
      handler (n) {
        this.defaultWather(n)
      }
    }
  },
  mounted () {
    // 初始化参与计算的各dom尺寸
    this.getDomSize()
    // 当使用固定宽度时，需要在可用尺寸(TODO:应检测容器)变化时更新比例
    const globalResize = () => {
      if (this.leftRate === this.defaultLeftRate) {
        this.defaultWather(this.default)
      }
    }
    this.$once('hook:mounted', () => {
      window.addEventListener('resize', globalResize)
    })
    this.$once('hook:destroyed', () => {
      window.removeEventListener('resize', globalResize)
    })
  },
  methods: {
    defaultWather (n) {
      // 无效的default不做变更
      if (!Number.isFinite(n)) return void(0)
      // default 小于等于 1 视为比例
      else if (n <= 1) this.leftRate = n
      // default 大于 1 视为固定数值
      else {
        new Promise(resolve => {
          if (this.$refs.sc_container) {
            resolve()
          } else {
            this.$once('hook:mounted', resolve)
          }
        }).then(() => {
          // 在保证获得正确的dom尺寸后，计算比例
          this.getDomSize()
          const fullRate = (n + (this.centerWidth / 2)) / this.domWidth
          this.defaultLeftRate = fullRate.toFixed(2) - 0
          this.leftRate = this.defaultLeftRate
        })
      }
    },
    getDomSize () {
      const container = this.$refs.sc_container
      this.domPageX = getDomPageX(container)
      this.domWidth = getDomWidth(container)
      if (this.$refs.scc) {
        this.centerWidth = getDomWidth(this.$refs.scc)
      }
    },
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
  .sc-center {
    flex-grow: 0;
    flex-shrink: 0;
    position: relative;
  }
  .sc-bamboo {
    width: 8px;
    height: 100%;
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
  .sc-on-bamboo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #FFF;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>

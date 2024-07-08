<template>
<el-scrollbar
  ref="scrollbar"
  :wrap-style="mergeWrapStyle"
  v-bind="$attrs"
  v-on="$listeners">
  <slot />
</el-scrollbar>
</template>

<script>
import scrollbarWidth from 'element-ui/src/utils/scrollbar-width'
export default {
  inheritAttrs: false,
  props: {
    wrapStyle: { type: String, default: '' }
  },
  data () {
    return {
      timer: null
    }
  },
  computed: {
    isEdge () {
      return /Edg/.test(window.navigator.userAgent)
    },
    mergeWrapStyle () {
      return (
        `height: calc(100% + ${scrollbarWidth()}px);${this.wrapStyle};`
        // 修复在edge浏览器中的问题
        + (this.isEdge ? `width: calc(100% + ${scrollbarWidth() + 1}px);` : '')
      )
    }
  },
  mounted () {
    window.addEventListener('resize', this.resizeFunc)
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeFunc)
  },
  methods: {
    resizeFunc () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.scrollbar.update()
      }, 300)
    }
  }
}
</script>

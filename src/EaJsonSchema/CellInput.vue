<template>
<el-tag v-if="isTag" :disable-transitions="true">{{ value }}</el-tag>
<el-tag v-else-if="isRoot" :disable-transitions="true">根节点</el-tag>
<i v-else-if="isDisabled" class="eafont ea-icon-disabled" />
<div
  v-else-if="!row.__state.isEdit[uuid]"
  class="cell-text"
  :title="value"
  @click="handleClick">
  <span v-if="value === undefined" class="cell-placeholder">{{ $attrs.placeholder }}</span>
  <span v-else>{{ value }}</span>
</div>
<el-input
  v-else
  class="cell-input"
  :value="value"
  v-bind="$attrs"
  @input="handleInput"
  @blur="handleBlur" />
</template>

<script>
import { uuid } from '@/util'
export default {
  inheritAttrs: false,
  props: {
    value: { type: String, default: undefined },
    row: { type: Object, default: undefined },
    isTag: { type: Boolean, default: false },
    isRoot: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false }
  },
  data () {
    return {
      uuid: uuid()
    }
  },
  methods: {
    async handleClick (evt) {
      if (this.isTag) return void(0)
      const parent = evt.target.parentElement.parentElement
      this.$set(this.row.__state.isEdit, this.uuid, true)
      await this.$nextTick()
      try {
        parent.querySelector('input').focus()
      } catch (err) {
        this.uuid = uuid()
        this.$set(this.row.__state.isEdit, this.uuid, true)
        await this.$nextTick()
        parent.querySelector('input').focus()
      }
    },
    handleInput (evt) {
      this.$emit('input', evt)
    },
    handleBlur () {
      this.row.__state.isEdit[this.uuid] = false
    }
  }
}
</script>

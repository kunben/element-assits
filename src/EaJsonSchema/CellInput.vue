<template>
<el-tag v-if="isTag" :disable-transitions="true">{{ value }}</el-tag>
<el-tag v-else-if="isRoot" :disable-transitions="true">根节点</el-tag>
<i v-else-if="isDisabled" class="eafont ea-icon-disabled ea-placeholder" />
<div
  v-else-if="!row.__state.isEdit[uuid]"
  class="cell-text"
  :title="value"
  @click="handleClick">
  <span v-if="value === undefined && allowEdit" class="cell-placeholder">{{ $attrs.placeholder }}</span>
  <span v-else>{{ value }}</span>
</div>
<el-input
  v-else
  ref="inp"
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
    isDisabled: { type: Boolean, default: false },
    allowEdit: { type: Boolean, default: true }
  },
  data () {
    return {
      uuid: uuid()
    }
  },
  methods: {
    async handleClick () {
      if (this.isTag) return void(0)
      if (!this.allowEdit) return void(0)
      this.$set(this.row.__state.isEdit, this.uuid, true)
      await this.$nextTick()
      try {
        this.$refs.inp.$el.querySelector('input').focus()
      } catch (err) {
        console.log(err)
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

<template>
<div
  v-if="row.__state.isRoot || row.__state.virtualArrayItems"
  class="eafont ea-icon-disabled ea-placeholder" />
<div v-else class="cell-required">
  <span :class="{'box': 1, 'is-required': value, 'is-disabled': !allowEdit}" @click="handleClick">*</span>
</div>
</template>

<script>
export default {
  props: {
    value: { type: [String, Boolean], default: undefined },
    row: { type: Object, default: undefined },
    allowEdit: { type: Boolean, default: true }
  },
  methods: {
    async handleClick () {
      if (!this.allowEdit) return void(0)
      this.$emit('input', !this.value)
    }
  }
}
</script>

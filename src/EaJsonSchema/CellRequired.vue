<template>
<div v-if="row.__state.isRoot || row.__state.virtualArrayItems" class="eafont ea-icon-disabled" />
<div v-else class="cell-required">
  <span :class="{'box': 1, 'is-required': value}" @click="handleClick">*</span>
</div>
</template>

<script>
export default {
  props: {
    value: { type: [String, Boolean], default: undefined },
    row: { type: Object, default: undefined }
  },
  methods: {
    async handleClick () {
      this.$emit('input', !this.value)
    }
  }
}
</script>

<template>
<el-button type="primary" @click="handleClick">测试弹窗</el-button>
</template>

<script>
export default {
  methods: {
    handleClick () {
      this.$asyncLoad(() => import('./TestModal'))
    }
  }
}
</script>

<template>
<div>
  <el-button type="primary" @click="handleClick">测试弹窗</el-button>
  <el-button type="primary" @click="handleClick2">测试抽屉</el-button>
</div>
</template>

<script>
export default {
  methods: {
    handleClick () {
      this.$asyncLoad(() => import('./TestModal'))
    },
    handleClick2 () {
      this.$asyncLoad(() => import('./TestDrawer'))
    }
  }
}
</script>

<template>
<div class="box">
  <EaVirtualScroll :options="list" :item-size="30" />
</div>
</template>

<script>
const list = new Array(400).fill(0).map((m, i) => {
  return {
    label: '单项' + i,
    value: i
  }
})
export default {
  data () {
    return {
      list
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  width: 500px;
  height: 500px;
  overflow: auto;
  margin: 0 auto;
  border: 1px solid red;
}
</style>

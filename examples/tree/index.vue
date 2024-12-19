<template>
<div style="width: 400px">
  <EaTree :data="testData" />
</div>
</template>

<script>

export const testData = Array(100).fill(0).map((m, i) => {
  return {
    label: '测试名称测试名称测试名称测试名称测试名称测试名称' + i,
    value: 'id_' + i
  }
})

export default {
  data () {
    return {
      testData
    }
  }
}
</script>

<template>
<EaModal
  title="测试"
  :visible.sync="visible"
  :allow-drag="true"
  custom-class="abc"
  append-to-body>
  <div>
    <p v-for="m in 20">123</p>
  </div>
</EaModal>
</template>

<script>
export default {
  data () {
    return {
      visible: false
    }
  },
  mounted () {
    this.visible = true
  }
}
</script>

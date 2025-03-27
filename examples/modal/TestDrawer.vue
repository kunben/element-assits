<template>
<EaDrawer
  title="抽屉标题"
  :visible.sync="visible"
  :confirm-loading="confirmLoading"
  @confirm="handleConfirm"
  @cancel="visible=false">
  <div slot="title">123</div>
  <!-- <div slot="footer">
    123
  </div> -->
  <div>
    <p v-for="m in 100">123</p>
  </div>
</EaDrawer>
</template>

<script>
export default {
  components: {},
  data () {

    return {
      confirmLoading: false,
      visible: false
    }
  },
  mounted () {
    this.visible = true
  },
  methods: {
    handleConfirm () {
      this.confirmLoading = true
    }
  }
}
</script>

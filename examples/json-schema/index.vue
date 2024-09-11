<template>
<div style="width:840px;overflow: auto;margin: 0 auto;">
  <el-button
    type="primary"
    @click="handleValidate">校验</el-button>
  <el-button
    type="primary"
    style="margin-bottom:20px"
    @click="handleGetResult">获取结果</el-button>
  <EaJsonSchema
    ref="ejs"
    v-model="data"
    :allow-edit="false"
    :checkbox="true"
    @input="handleInput" />
</div>
</template>

<script>
import { data } from './data'

export default {
  data () {
    return {
      data
    }
  },
  methods: {
    handleValidate () {
      console.log(this.$refs.ejs.validate())
    },
    handleGetResult () {
      console.log(this.$refs.ejs.getData())
    },
    handleInput (e) {
      console.log(e)
    }
  }
}
</script>

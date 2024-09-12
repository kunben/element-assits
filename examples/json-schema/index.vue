<template>
<div style="width:840px;overflow: auto;margin: 0 auto;">
  <el-switch
    v-model="allowEdit"
    active-text="允许编辑"
    inactive-text="不允许编辑" />
  <br>
  <el-switch
    v-model="checkbox"
    active-text="允许选中"
    inactive-text="不允许选中" />
  <br>
  <el-button
    type="primary"
    @click="handleValidate">校验</el-button>
  <el-button
    type="primary"
    @click="handleGetResult">获取结果</el-button>
  <el-button
    type="primary"
    @click="handleGetChecked">获取选中结果</el-button>
  <el-button
    type="primary"
    @click="handleSetChecked">设置选中</el-button>
  <EaJsonSchema
    ref="ejs"
    v-model="data"
    style="margin-top:12px"
    :allow-edit="allowEdit"
    :checkbox="checkbox"
    @input="handleInput" />
</div>
</template>

<script>
import { data } from './data'

export default {
  data () {
    return {
      data,
      allowEdit: true,
      checkbox: true
    }
  },
  methods: {
    handleValidate () {
      console.log(this.$refs.ejs.validate())
    },
    handleGetResult () {
      console.log(this.$refs.ejs.getData())
    },
    handleGetChecked () {
      console.log(this.$refs.ejs.getChecked())
    },
    handleSetChecked () {
      const defaultChecked = [
        'properties.result',
        'properties.result.properties.city',
        'properties.result.properties.city.properties.City',
        'properties.result.properties.city.properties.UserIp',
        'properties.result.properties.condition.properties.day_weather'
      ]
      console.log(defaultChecked)
      this.$refs.ejs.setChecked(defaultChecked)
    },
    handleInput (e) {
      console.log(e)
    }
  }
}
</script>

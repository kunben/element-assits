<template>
<div style="margin: 0 auto;width: 700px">
  <EaForm
    :model="form"
    :column="formColumn"
    label-width="120px" />
  <div>
    <el-button type="primary" @click="handleConfirm">确定</el-button>
  </div>
</div>
</template>

<script>
import { column } from './column'
const formColumn = [
  { label: 'A', prop: 'A', span: 24 },
  { label: 'B', prop: 'B', span: 24 },
  { label: 'C', prop: 'C', span: 24 },
  { label: 'D', prop: 'D', span: 24 },
  {
    title: '其他信息',
    children: [
      { label: 'F', prop: 'F' },
      { label: 'G', prop: 'G' }
    ]
  }
]
export default {
  data () {
    return {
      form: {},
      column,
      formColumn
    }
  },
  methods: {
    handleConfirm () {
      console.log(this.form)
    }
  }
}
</script>

<template>
<div>
  <div class="conf-header">
    <span class="ea-blue">高级配置</span>
    <span class="ea-success" style="margin-left:8px">{{ row.type }}</span>
    <span style="margin-left:8px">{{ row.prop }}</span>
  </div>
  <div class="conf-body">
    <EaForm
      ref="eform"
      :model="form"
      :column="column"
      :dense="true"
      class="dense-much"
      size="mini" />
  </div>
</div>
</template>

<script>
import { allColumns } from './util'
import EaForm from '../EaForm'
export default {
  components: { EaForm },
  props: {
    row: { type: Object, required: true }
  },
  data () {
    const column = allColumns.matchType(this.row.type)
    return {
      form: {},
      column
    }
  },
  mounted () {
    this.$refs.eform.setData(this.row)
    this.$parent.$parent.$on('closed', this.parentLeave)
  },
  destroyed () {
    this.$parent.$parent.$off('closed', this.parentLeave)
  },
  methods: {
    parentLeave () {
      this.$emit('done', this.form)
    }
  }
}
</script>

<style lang="scss">
.conf-header {
  border-bottom: 1px solid #DDD;
  padding-bottom: 10px;
  margin-bottom: 10px;
}
.conf-body {
  width: 300px;
}
.dense-much .el-form-item {
  margin-bottom: 8px !important;
}
</style>

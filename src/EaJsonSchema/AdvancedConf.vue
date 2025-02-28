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
import EaForm from '../EaForm'
export default {
  components: { EaForm },
  props: {
    row: { type: Object, required: true },
    advancedConfColumn: { type: Object, required: true }
  },
  data () {
    const column = this.advancedConfColumn.matchType(this.row.type)
    return {
      form: {},
      column
    }
  },
  mounted () {
    // 特别地
    if (this.row) {
      const _row = { ...this.row }
      if (Array.isArray(_row.enum)) {
        _row.enableEnum = _row.enableEnum === undefined ? true : _row.enableEnum
        _row.enum = _row.enum.join('\n')
      }
      this.$refs.eform.setData(_row)
    }
    this.$parent.$parent.$on('closed', this.parentLeave)
  },
  destroyed () {
    this.$parent.$parent.$off('closed', this.parentLeave)
  },
  methods: {
    parentLeave () {
      // 特别地
      const _form = { ...this.form }
      if (typeof _form.enum === 'string') {
        _form.enum = _form.enum.split('\n').filter(Boolean)
      }
      this.$emit('done', _form)
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

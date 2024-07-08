<template>
<div style="width: 1200px;margin:0 auto;">
  <EaTable
    :column="column"
    :data="data"
    :inner-form="{ column: searchColumn, model: searchForm }"
    :inner-pagination="true">
    <template #top-menu>
      <el-button type="primary" icon="el-icon-plus">新增</el-button>
      <el-button type="primary" icon="el-icon-plus">新增</el-button>
    </template>
    <template #row-menu="scope">
      <el-button
        style="padding:0;"
        type="text"
        icon="el-icon-edit"
        @click="handleEdit(scope)">编辑</el-button>
    </template>
    <template #bottom-menu>
      <el-button type="primary" icon="el-icon-delete">批量删除</el-button>
    </template>
  </EaTable>
</div>
</template>

<script>
import { data } from './data'
import { column, searchColumn } from './column'
export default {
  data () {
    return {
      i: 2,
      data,
      column,
      searchForm: { a: 1 },
      searchColumn
    }
  },
  methods: {
    handleEdit (scope) {
      console.log(scope)
    },
    pageRequest () {
      return Promise.resolve({
        data: data,
        total: data.length * 5000000000
      })
    }
  }
}
</script>

<template>
<div style="margin:0 auto;">
  <EaTable
    :column="column"
    :data="data"
    :inner-form="{ column: searchColumn, model: searchForm }"
    :inner-pagination="true"
    :inner-operation="{maxNumOfBtn: 3 }"
    :inner-selection="{data: selectedRows}">
    <template #top-menu>
      <el-button type="primary" icon="el-icon-plus">新增</el-button>
      <el-button type="primary" icon="el-icon-plus">新增</el-button>
    </template>
    <template #row-menu="scope">
      <el-button type="text" icon="el-icon-view">查看</el-button>
      <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope)">编辑</el-button>
      <el-button type="text" icon="el-icon-delete" @click="handleDel(scope)">删除</el-button>
      <el-button type="text" icon="el-icon-reading">比较</el-button>
      <el-button type="text" icon="el-icon-s-operation">历史记录</el-button>
    </template>
    <template #bottom-menu>
      <el-button
        type="primary"
        :disabled="!selectedRows.length"
        icon="el-icon-delete">批量删除</el-button>
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
      searchColumn,
      selectedRows: []
    }
  },
  methods: {
    handleEdit (scope) {
      console.log(scope)
    },
    handleDel (scope) {
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

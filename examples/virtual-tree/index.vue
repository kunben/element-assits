<template>
<div>
  <el-button type="primary" @click="handleUpdateData">更新数据</el-button>
  <EaDataTree
    :data="data"
    :checkbox="true"
    style="width:800px;margin: 0 auto;"
    :props="{ hasChildren: '__hasChildren'}"
    :load-method="loadMethod" />
</div>
</template>

<script>
import { cloneDeep } from 'lodash-es'
import EaDataTree from '../../src/EaDataTree'
export default {
  components: { EaDataTree },
  data () {
    return {
      data: [
        { label: 'abc', value: 1, __hasChildren: true },
        { label: 'def', value: 2, __hasChildren: true },
        {
          label: 'hij',
          value: 3,
          children: [
            { label: 'H', value: 4 },
            { label: 'I', value: 5 },
            {
              label: 'J',
              value: 6,
              children: [
                { label: 'J11', value: 7 },
                { label: 'J22', value: 8 },
                { label: 'J33', value: 9 },
                { label: 'J44', value: 10 }
              ]
            }
          ]
        },
        {
          label: 'klm',
          value: 7,
          children: new Array(30).fill(0).map((m, i) => ({
            label: 'M--' + i,
            value: i
          }))
        }
      ]
    }
  },
  methods: {
    loadMethod (item) {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (item.value == 1) {
            resolve([
              { label: 'abc-1', value: '1' },
              { label: 'abc-2', value: '1' }
            ])
          } else {
            resolve([
              { label: 'def-1', value: '44' },
              { label: 'def-2', value: '55' }
            ])
          }
        }, 700)
      })
    },
    handleUpdateData () {
      const temp = cloneDeep(this.data)
      temp.push({ label: '新数据', value: '33333' })
      this.data = temp
    }
  }
}
</script>

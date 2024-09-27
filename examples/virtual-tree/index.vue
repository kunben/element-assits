<template>
<EaDataTree :data="data" :checkbox="true" style="width:800px;margin: 0 auto;" />
</template>

<script>
import EaDataTree from '../../src/EaDataTree'
export default {
  components: { EaDataTree },
  data () {
    return {
      data: [
        { label: 'abc', value: 1 },
        { label: 'def', value: 2 },
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
                { label: 'J22', value: 7 },
                { label: 'J33', value: 7 },
                { label: 'J44', value: 7 }
              ]
            }
          ]
        },
        {
          label: 'klm',
          value: 7,
          children: new Array(500).fill(0).map((m, i) => ({
            label: 'M--' + i,
            value: i
          }))
        }
      ]
    }
  }
}
</script>

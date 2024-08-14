<template>
<el-checkbox-group v-bind="$attrs" v-on="$listeners">
  <el-checkbox
    v-for="(item, i) in options"
    :key="i"
    :label="item[endProps.value]"
    v-bind="innerCheckbox">
    {{ item[endProps.label] }}
  </el-checkbox>
</el-checkbox-group>
</template>

<script>
import { isFunction } from 'lodash-es'
export default {
  inheritAttrs: false,
  props: {
    data: { type: Array, default: undefined },
    asyncData: { type: Function, default: undefined },
    props: { type: Object, default: undefined },
    innerCheckbox: { type: Object, default: undefined }
  },
  data () {
    return {
      list: []
    }
  },
  computed: {
    options () {
      return this.data || this.list
    },
    endProps () {
      return { label: 'label', value: 'value', ...this.props }
    }
  },
  mounted () {
    if (isFunction(this.asyncData)) {
      this.asyncData().then(list => { this.list = list })
    }
  },
  methods: {}
}
</script>

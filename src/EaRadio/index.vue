<template>
<el-radio-group v-bind="$attrs" v-on="$listeners">
  <template v-if="type === 'button'">
    <el-radio-button
      v-for="(item, i) in options"
      :key="i"
      :label="item[endProps.value]"
      v-bind="innerRadio">
      {{ item[endProps.label] }}
    </el-radio-button>
  </template>
  <template v-else>
    <el-radio
      v-for="(item, i) in options"
      :key="i"
      :label="item[endProps.value]"
      :style="{marginRight: 0}"
      border
      v-bind="innerRadio">
      {{ item[endProps.label] }}
    </el-radio>
  </template>
</el-radio-group>
</template>

<script>
import { isFunction } from 'lodash-es'
export default {
  inheritAttrs: false,
  props: {
    data: { type: Array, default: undefined },
    asyncData: { type: Function, default: undefined },
    props: { type: Object, default: undefined },
    defaultFirst: { type: Boolean, default: false },
    innerRadio: { type: Object, default: undefined },
    type: { type: String, default: undefined }
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
      this.asyncData().then(list => {
        this.list = list
        this.whenReady()
      })
    } else {
      this.whenReady()
    }
  },
  methods: {
    whenReady () {
      if (!this.defaultFirst) return void(0)
      if (this.$attrs.value !== undefined) return void(0)
      if (this.options.length <= 0) return void(0)
      this.$emit('input', this.options[0][this.endProps.value])
    }
  }
}
</script>

<template>
<el-form
  ref="form"
  :model="model"
  :rules="rules"
  :inline="inline"
  :label-width="labelWidth"
  class="ea-form"
  v-bind="$attrs"
  v-on="$listeners"
  @submit.native.prevent>
  <slot name="content-before" />
  <LayoutContainer :column="dealtColumn" :inline="inline" :dense="dense" />
  <slot />
</el-form>
</template>

<script>
import LayoutContainer from './LayoutContainer.vue'
import isArray from 'lodash/isArray'
import isNil from 'lodash/isNil'
import get from 'lodash/get'
import isFunction from 'lodash/isFunction'
import isPlainObject from 'lodash/isPlainObject'
import differenceBy from 'lodash/differenceBy'
import cloneDeep from 'lodash/cloneDeep'
import { recursive } from '../util'
export default {
  components: { LayoutContainer },
  provide () {
    return {
      top: this
    }
  },
  inheritAttrs: false,
  props: {
    model: { type: Object, default: () => ({}) },
    rules: { type: Object, default: () => ({}) },
    column: { type: Array, default: () => ([]) },
    labelWidth: { type: String, default: undefined },
    inline: { type: Boolean, default: false },
    dense: { type: Boolean, default: false }
  },
  data () {
    return {
      rawColumn: []
    }
  },
  computed: {
    formKey () {
      return JSON.stringify(this.model) + Date.now()
    },
    dealtColumn () {
      const __father = [{ children: this.rawColumn }]
      recursive(__father, item => {
        if (!get(item, 'children.length')) return void(0)
        item.children = item.children.filter(m => {
          this.setValue(m)
          if (isFunction(m.show)) return m.show(this.model, this)
          return m.show !== false
        }).map(m => {
          return this.dealtItem(m, this.formKey)
        })
      })
      return __father[0].children
    }
  },
  watch: {
    column: {
      immediate: true,
      handler (newColumn, oldColumn) {
        if (!isArray(newColumn)) return void(0)
        const cloneColumn = [...newColumn]
        // 找到移除的column，并从model中删除它们
        const deletedColumn = differenceBy(oldColumn, newColumn, m => m.prop)
        deletedColumn.forEach(m => {
          this.$delete(this.model, m.prop)
        })
        this.rawColumn = cloneColumn
      }
    }
  },
  mounted () {
    this.validate = this.$refs.form.validate
    this.resetFields = this.$refs.form.resetFields
    this.validateField = this.$refs.form.validateField
    this.clearValidate = this.$refs.form.clearValidate
  },
  methods: {
    async setData (row) {
      for (const [k] of Object.entries(this.model)) {
        if (isNil(row[k])) continue
        this.model[k] = row[k]
      }
      await this.$nextTick()
      for (const [k] of Object.entries(this.model)) {
        if (isNil(row[k])) continue
        this.model[k] = row[k]
      }
    },
    setValue (item) {
      const currentValue = this.model[item.prop]
      const defaultValue = cloneDeep(item.defaultValue)
      const value = currentValue === undefined ? defaultValue : currentValue
      this.$set(this.model, item.prop, value)
    },
    dealtItem (item, __key) {
      const params = [this.model, this]
      const __item = {}
      const __component = (
        isFunction(item.component)
          ? item.component(...params)
          : item.component
      ) || 'el-input'
      const __rules = []
      item.required && __rules.push({ required: true, message: '必填信息' })
      if (isFunction(item.rules)) {
        const returnRules = item.rules(...params)
        isArray(returnRules) && __rules.push(...returnRules)
      } else if (isArray(item.rules)) {
        __rules.push(...item.rules)
      }
      const __on = {}
      if (isFunction(item.on)) Object.assign(__on, item.on(...params))
      else if (isPlainObject(item.on)) Object.assign(__on, item.on)
      const __bind = { clearable: true, placeholder: item.label }
      Object.assign(__bind, isFunction(item.bind) ? item.bind(...params) : item.bind)
      const __label = isFunction(item.label) ? item.label(...params) : item.label
      const __labelTooltip = isFunction(item.labelTooltip) ? item.labelTooltip(...params) : item.labelTooltip
      return Object.assign({}, item, __item, {
        __key,
        __label,
        __labelTooltip,
        __component,
        __rules,
        __on,
        __bind
      })
    }
  }
}
</script>

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
import { isArray, isNil, get, isFunction, isPlainObject, differenceBy, cloneDeep } from 'lodash-es'
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
          const show = isFunction(m.show) ? m.show(this.model, this) : (m.show !== false)
          const enable = isFunction(m.enable) ? m.enable(this.model, this) : (m.enable !== false)
          if (!enable) {
            this.$delete(this.model, m.prop)
          }
          return show && enable
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
        this.rawColumn = cloneColumn
        this.deleteLostProp(newColumn, oldColumn)
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
      const __label = isFunction(item.label) ? item.label(...params) : item.label
      const __labelTooltip = isFunction(item.labelTooltip) ? item.labelTooltip(...params) : item.labelTooltip
      const __bind = { clearable: true, placeholder: __label }
      Object.assign(__bind, isFunction(item.bind) ? item.bind(...params) : item.bind)
      return Object.assign({}, item, __item, {
        __key,
        __label,
        __labelTooltip,
        __component,
        __rules,
        __on,
        __bind
      })
    },
    deleteLostProp (newColumn, oldColumn) {
      const __newProps = this.flatTreeProp(newColumn)
      const __oldProps = this.flatTreeProp(oldColumn)
      const deletedColumn = differenceBy(__oldProps, __newProps)
      deletedColumn.forEach(prop => this.$delete(this.model, prop))
    },
    flatTreeProp (tree) {
      const result = []
      recursive(isArray(tree) ? tree : [], item => {
        result.push(item.prop)
      })
      return result.filter(m => m)
    }
  }
}
</script>

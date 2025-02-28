import { get, set, omit, isPlainObject, isEmpty } from 'lodash-es'
import { uuid as createUUID } from '@/util'
import EaSwitch from '../EaSwitch'
import EaNumber from '../EaNumber'
import CellInput from './CellInput.vue'
import CellSelect from './CellSelect.vue'
import CellRequired from './CellRequired.vue'

const typeOptions = [
  { label: 'string', value: 'string', colorClass: 'ea-success' },
  { label: 'number', value: 'number', colorClass: 'ea-success' },
  { label: 'integer', value: 'integer', colorClass: 'ea-purple' },
  { label: 'object', value: 'object', colorClass: 'ea-blue' },
  { label: 'array', value: 'array', colorClass: 'ea-blue' },
  { label: 'boolean', value: 'boolean', colorClass: 'ea-purple' }
]

export const column = [
  {
    label: '字段',
    prop: 'prop',
    width: 280,
    component: CellInput,
    bind: { placeholder: '字段' }
  },
  {
    label: '是否必填',
    prop: 'required',
    width: 80,
    component: CellRequired
  },
  {
    label: '类型',
    prop: 'type',
    width: 100,
    component: CellSelect,
    bind: { data: typeOptions, placeholder: '类型' }
  },
  {
    label: '中文名',
    prop: 'title',
    width: 130,
    component: CellInput,
    bind: { placeholder: '中文名', virtualArrayItemsDisabled: true }
  },
  {
    label: '描述',
    prop: 'description',
    width: 100,
    component: CellInput,
    flex: true,
    bind: { placeholder: '描述' }
  }
]

export class ItemState {
  constructor (level, uuid, prefix, parent) {
    // 随机的唯一ID
    this.uuid = uuid
    // 当前行 树的层级数
    this.level = level
    // 当前行 字段前缀
    this.prefix = prefix
    // 当前行 是否根节点
    this.isRoot = false
    // 当前行的单元格是否编辑的状态集合
    this.isEdit = {}
    // 当前行是否拥有下一级
    this.hasChildren = false
    // 当前行是否显示，不同树层级控制的状态集合（只有当所有层级都为真时才显示）
    this.show = { [prefix]: true }
    // 当前行是否展开
    this.isExpanded = false
    // 当前行是否是临时行
    this.isTemp = false
    // 当前行是否是虚拟数组节点
    this.virtualArrayItems = false
    // 当前行校验错误的字段
    this.error = {}
    // 当前行 操作栏key
    this.actionKey = createUUID()
    // 当前行 是否选中
    this.checked = false
    // 当前行 是否半选
    this.indeterminate = false
    // 当前行 的父节点
    this.parent = parent
  }
}

// schema to list
export function translateSchema (
  data, // 值
  rootAlias, // 根节点别名
  k, // 键
  level = 0, // 树层级
  result = [], // 结果
  path = [], // 路径
  isRoot = true, // 是否根节点
  parent, // 父数据
  parentNode // 父节点
) {
  const uuid = createUUID()
  const prop = k || rootAlias
  level ++
  path.push(uuid)
  const prefix = path.join('.')
  // 相比 json-schema 规范，冗余的字段有：
  // prop 属性名
  // required 是否必填
  // __state 状态集合
  // 缺少的有:
  // properties, required
  // 目的是拉平树形数据，
  const parentRequired = parent && parent.required || []
  const required = parentRequired.includes(prop)
  const item = {
    ...omit(data, ['properties', 'required']),
    prop,
    required,
    __state: new ItemState(level, uuid, prefix, parentNode)
  }
  item.__state.virtualArrayItems = false
  if (parent && parent.type === 'array' && prop === 'items') {
    item.__state.virtualArrayItems = true
  }
  item.__state.isRoot = isRoot
  result.push(item)
  if (data.type === 'object') {
    if (isPlainObject(data.properties) && !isEmpty(data.properties)) {
      item.__state.hasChildren = true
      item.__state.isExpanded = true
      for (let [k, v] of Object.entries(data.properties)) {
        translateSchema(v, rootAlias, k, level, result, [...path], false, data, item)
      }
    }
  } else if (data.type === 'array') {
    if (isPlainObject(data.items)) {
      item.__state.hasChildren = true
      item.__state.isExpanded = true
      translateSchema(data.items, rootAlias, 'items', level, result, [...path], false, data, item)
    }
  }
  return result
}

// TODO: 需优化
// list to schema
export function translateList (list, rootAlias, result = {}) {
  list.filter(m => !m.__state.isTemp && m.prop).forEach(item => {
    const realPrefix = item.__state.prefix.split('.').reduce((acc, m) => {
      const found = list.find(n => n.__state.uuid === m)
      acc.push(found.prop)
      if (found.type === 'object') acc.push('properties')
      return acc
    }, [])
    if (realPrefix[realPrefix.length - 1] === 'properties') {
      realPrefix.pop()
    }
    set(result, realPrefix.join('.'), omit(item, ['prop', 'required', '__state']))
    realPrefix.pop()
    realPrefix.pop()
    const parent = get(result, realPrefix)
    if (item.required && parent) {
      parent.required = parent.required || []
      parent.required.push(item.prop)
    }
  })
  return result[rootAlias]
}

// prefix to realPath
export function prefixToRealPath (prefix, rawList) {
  const realPath = prefix.split('.').reduce((acc, item) => {
    const found = rawList.find(m => m.__state.uuid === item)
    acc.push(found.prop)
    if (found.type === 'object') acc.push('properties')
    return acc
  }, [])
  if (realPath[realPath.length - 1] === 'properties') realPath.pop()
  return realPath
}
// prefix to dataPath
export function prefixToDataPath (prefix, rawList, callback = e => e) {
  return prefix.split('.').reduce((acc, item) => {
    const found = rawList.find(m => m.__state.uuid === item)
    acc.push(callback(found.prop, found))
    return acc
  }, [])
}

export function getRange (item, index, list) {
  let start = index + 1
  let end = start
  for (let i = start; i < list.length; i++) {
    const m = list[i]
    if (m.__state.level <= item.__state.level) {
      end = i // 不包含同级项
      break
    }
    if (i === list.length - 1) {
      end = i + 1 // 没有找到同级或高一级项，包含最后一项
    }
  }
  return [start, end]
}

export class TypesColumn {
  constructor (callback) {
    this.string = [
      { label: '默认值', prop: 'default', span: 24 },
      { label: '最小长度', prop: 'minLength', component: EaNumber },
      { label: '最大长度', prop: 'maxLength', component: EaNumber },
      {
        label: '是否启用枚举',
        prop: 'enableEnum',
        component: EaSwitch,
        defaultValue: false,
        span: 24,
        bind: { size: 'mini' }
      },
      {
        label: '枚举',
        prop: 'enum',
        span: 24,
        show: theForm => theForm.enableEnum,
        bind: { type: 'textarea', rows: 3 }
      },
      {
        label: '枚举描述',
        prop: 'enumDesc',
        span: 24,
        show: theForm => theForm.enableEnum,
        bind: { type: 'textarea', rows: 3 }
      }
    ]
    this.number = [
      { label: '默认值', prop: 'default', span: 24 },
      { label: '最小值', prop: 'minimum', component: EaNumber },
      { label: '最大值', prop: 'maximum', component: EaNumber },
      {
        label: '是否启用枚举',
        prop: 'enableEnum',
        component: EaSwitch,
        defaultValue: false,
        span: 24,
        bind: { size: 'mini' }
      },
      {
        label: '枚举',
        prop: 'enum',
        span: 24,
        show: theForm => theForm.enableEnum,
        bind: { type: 'textarea', rows: 3 }
      },
      {
        label: '枚举描述',
        prop: 'enumDesc',
        span: 24,
        show: theForm => theForm.enableEnum,
        bind: { type: 'textarea', rows: 3 }
      }
    ]
    this.boolean = [
      {
        label: '默认值',
        prop: 'default',
        span: 24,
        component: EaSwitch,
        bind: { size: 'mini', activeText: 'true', inactiveText: 'false' }
      }
    ]
    this.object = [
      {
        label: '是否允许为空',
        prop: 'notEmpty',
        defaultValue: true,
        span: 24,
        component: EaSwitch,
        bind: { size: 'mini' }
      }
    ]
    this.array = [
      { label: '最小元素个数', prop: 'minItems', component: EaNumber },
      { label: '最大元素个数', prop: 'maxItems', component: EaNumber }
    ]
    callback && callback(this)
  }
  matchType (type) {
    const columnType = type === 'integer' ? 'number' : type
    return this[columnType] || []
  }
  computeNotEmpty (data) {
    const currentColumn = this.matchType(data.type)
    return !currentColumn.every(item => {
      const defaultValue = item.defaultValue
      return (
        data[item.prop] === defaultValue
        || data[item.prop] === undefined
      )
    })
  }
}

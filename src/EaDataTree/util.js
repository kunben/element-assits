import { uuid as createUUID } from '@/util'

class ItemState {
  constructor (level, uuid, uuidPath, parent) {
    // 随机的唯一ID
    this.uuid = uuid
    // 当前行 树的层级数
    this.level = level
    // 当前行 字段前缀
    this.uuidPath = uuidPath
    // 当前行是否拥有下一级
    this.hasChildren = false
    // 当前行是否显示，不同树层级控制的状态集合（只有当所有层级都为真时才显示）
    this.show = { [level]: true }
    // 当前行是否展开
    this.isExpanded = false
    // 是否正在展开加载
    this.expandLoading = false
    // 是否已经展开加载过了
    this.expandLoaded = false
    // 当前行 是否选中
    this.checked = false
    // 当前行 是否半选
    this.indeterminate = false
    // 当前行 的父节点
    this.parent = parent
  }
  inherit (srcState) {
    this.level = srcState.level
    this.hasChildren = srcState.hasChildren
    this.isExpanded = srcState.isExpanded
    this.expandLoading = srcState.expandLoading
    this.expandLoaded = srcState.expandLoaded
    this.checked = srcState.checked
    this.indeterminate = srcState.indeterminate
    this.show = srcState.show
  }
}

export function translateTree (tree, props, uuidPath = [], parent = null, level = -1, result = []) {
  level ++
  for (let m of tree) {
    const uuid = createUUID()
    const currentUuidPath = [...uuidPath, uuid]
    const item = { ...m, __state: new ItemState(level, uuid, currentUuidPath.join('.'), parent) }
    item.__state.hasChildren = m[props.hasChildren]
    result.push(item)
    if (Array.isArray(m[props.children]) && m[props.children].length) {
      item.__state.hasChildren = true
      item.__state.isExpanded = true
      item.__state.expandLoaded = true
      translateTree(m[props.children], props, currentUuidPath, item, level, result)
    }
  }
  return result
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

// 获取子孙节点
export function getSubNodes (item, rawList) {
  const ind = rawList.findIndex(m => m.__state.uuidPath === item.__state.uuidPath)
  const found = rawList[ind]
  if (!found) return []
  const range = getRange(found, ind, rawList)
  return rawList.slice(range[0], range[1])
}

export function checkIndeterminateStatus (that, item, rawList) {
  if (item) {
    const list = getSubNodes(item, rawList)
    if (list.every(m => m.__state.checked)) {
      item.__state.indeterminate = false
      item.__state.checked = true
    } else if (list.every(m => !m.__state.checked)) {
      item.__state.indeterminate = false
      item.__state.checked = false
    } else {
      item.__state.indeterminate = true
      item.__state.checked = false
    }
    that.$emit('selection-change', item)
    checkIndeterminateStatus(that, item.__state.parent, rawList)
  }
}

export function setItemChecked (that, item, evt, rawList) {
  // 既然点选了当前项，则首先取消当前项的半选状态
  item.__state.indeterminate = false
  item.__state.checked = evt
  // 获得可被选择的子孙项
  const list = getSubNodes(item, rawList)
  // 使所有子孙项和当前项的选中结果一致
  list.forEach(m => {
    if (m.__state.checked === evt) return void(0)
    m.__state.indeterminate = false
    m.__state.checked = evt
    that.$emit('selection-change', m)
  })
  // 此后，递归检查上级的选中状态
  checkIndeterminateStatus(that, item.__state.parent, rawList)
}

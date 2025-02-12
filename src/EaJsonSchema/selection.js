import { getRange } from './util'
import { omit } from 'lodash'

// 获取子孙节点
export function getSubNodes (item, rawList) {
  const ind = rawList.findIndex(m => m.__state.prefix === item.__state.prefix)
  const found = rawList[ind]
  if (!found) return []
  const range = getRange(found, ind, rawList)
  return rawList.slice(range[0], range[1])
}

// 获取过滤后可被选取的节点
export function filterCanChecked (list) {
  return list.filter(m => {
    return !(
      m.__state.isRoot
      || m.__state.virtualArrayItems
      || m.__state.isTemp
    )
  })
}

export function checkIndeterminateStatus (that, item, rawList, silent) {
  if (item) {
    const list = filterCanChecked(getSubNodes(item, rawList))
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
    const _item = translateSelection([item], rawList)[0]
    !silent && that.$emit('selection-change', _item)
    checkIndeterminateStatus(that, item.__state.parent, rawList)
  } else {
    const allList = filterCanChecked(rawList)
    if (allList.every(m => m.__state.checked)) {
      that.indeterminate = false
      that.globalChecked = true
    } else if (allList.every(m => !m.__state.checked)) {
      that.indeterminate = false
      that.globalChecked = false
    } else {
      that.indeterminate = true
      that.globalChecked = false
    }
  }
}

export function setItemChecked (that, item, evt, rawList, silent) {
  // 既然点选了当前项，则首先取消当前项的半选状态
  item.__state.indeterminate = false
  item.__state.checked = evt
  // 获得可被选择的子孙项
  const list = filterCanChecked(getSubNodes(item, rawList))
  // 使所有子孙项和当前项的选中结果一致
  list.forEach(m => {
    if (m.__state.checked === evt) return void(0)
    m.__state.indeterminate = false
    m.__state.checked = evt
    const t = translateSelection([m], rawList)[0]
    !silent && that.$emit('selection-change', t)
  })
  // 此后，递归检查上级的选中状态
  checkIndeterminateStatus(that, item.__state.parent, rawList, silent)
}

export function translateSelection (selectedRows, rawList) {
  return selectedRows.map(item => {
    const realPrefix = item.__state.prefix.split('.').reduce((acc, m) => {
      const found = rawList.find(n => n.__state.uuid === m)
      acc.push(found.prop)
      if (found.type === 'object') acc.push('properties')
      return acc
    }, [])
    if (realPrefix[realPrefix.length - 1] === 'properties') {
      realPrefix.pop()
    }
    return {
      ...omit(item, ['required', '__state']),
      realPrefix,
      checked: item.__state.checked,
      indeterminate: item.__state.indeterminate
    }
  })
}

export function getRealPrefix (item, rawList) {
  const realPrefix = item.__state.prefix.split('.').reduce((acc, m) => {
    const found = rawList.find(n => n.__state.uuid === m)
    acc.push(found.prop)
    if (found.type === 'object') acc.push('properties')
    return acc
  }, [])
  if (realPrefix[realPrefix.length - 1] === 'properties') {
    realPrefix.pop()
  }
  realPrefix.shift()
  return realPrefix
}

// 判断是否是持续的路径
// properties.result.properties.forecast_list.items.properties.date
// properties.result.properties.forecast_list
// properties.result
export function isContinuousPath (path, list) {
  const cycle = p => {
    if (list.includes(p)) {
      const ind = p.lastIndexOf('properties')
      if (ind > 0) {
        const newPath = p.slice(0, ind - 1)
        return cycle(newPath.replace(/\.items$/, ''))
      }
      return true
    } else {
      return false
    }
  }
  return cycle(path)
}

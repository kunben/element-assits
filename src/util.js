// 随机 key
export const uuid = () => Math.random().toString()

// 递归
export const recursive = (data, callback, childrenProp = 'children', path = []) => {
  for (let i = 0; i < data.length; i ++) {
    if (callback && callback(data[i], path) === false) return false
    if (data[i][childrenProp] && data[i][childrenProp].length) {
      path.push(data[i])
      if (recursive(data[i][childrenProp], callback, childrenProp, path) === false) return false
    }
  }
  path.pop()
}

// 递归查找指定父组件
export const findParentComponent = (ins, pName) => {
  if (!ins || !pName) return void(0)
  if (ins.$parent.$options._componentTag === pName) return ins.$parent
  return findParentComponent(ins.$parent, pName)
}

export function addDragPosition (el) {
  const dialog = el.querySelector('.el-dialog')
  const header = el.querySelector('.el-dialog__header')
  header.style.cursor = 'all-scroll'
  // 状态 - 弹窗初始位置
  let initX = dialog.offsetLeft
  let initY = dialog.offsetTop
  // 状态 - 鼠标是否按下，和按下位置
  let isDown = false
  let downX, downY
  // 重置状态方法
  const resetStatus = () => {
    isDown = false
    downX = undefined
    downY = undefined
    initX = dialog.offsetLeft
    initY = dialog.offsetTop
  }
  const moveFunc = (evt) => {
    if (!isDown) return void(0)
    const _x = evt.pageX - downX
    const _y = evt.pageY - downY
    dialog.style.left = initX + _x + 'px'
    dialog.style.top = initY + _y + 'px'
  }
  // 初始化元素
  dialog.style.left = initX + 'px'
  dialog.style.top = initY + 'px'
  dialog.style.margin = 0
  header.addEventListener('mousedown', (evt) => {
    initX = dialog.offsetLeft
    initY = dialog.offsetTop
    downX = evt.pageX
    downY = evt.pageY
    isDown = true
  })
  document.addEventListener('mouseup', resetStatus)
  document.addEventListener('mousemove', moveFunc)
  return () => {
    document.removeEventListener('mouseup', resetStatus)
    document.removeEventListener('mousemove', moveFunc)
  }
}

export function addDragSize (el) {
  const dialog = el.querySelector('.el-dialog')
  const destroyList = [
    addResizer(dialog, 'left'),
    addResizer(dialog, 'right'),
    addResizer(dialog, 'top'),
    addResizer(dialog, 'bottom'),
    addResizer(dialog, 'top-left'),
    addResizer(dialog, 'top-right'),
    addResizer(dialog, 'bottom-left'),
    addResizer(dialog, 'bottom-right')
  ]
  return () => destroyList.forEach(m => m())
}

function addResizer (el, position) {
  const resizer = document.createElement('div')
  resizer.style.position = 'absolute'
  setResizerSelf(resizer, position)
  el.style.userSelect = 'none'
  el.appendChild(resizer)
  // 状态 - 弹窗初始位置
  let initX = el.offsetLeft
  let initY = el.offsetTop
  let initW = el.offsetWidth
  let initH = el.offsetHeight
  // 状态 - 鼠标是否按下，和按下位置
  let isDown = false
  let downX
  let downY
  // 重置状态方法
  const resetStatus = () => {
    isDown = false
    downX = undefined
    downY = undefined
    initX = el.offsetLeft
    initY = el.offsetTop
    initW = el.offsetWidth
    initH = el.offsetHeight
  }
  const moveFunc = (evt) => {
    if (!isDown) return void(0)
    const _x = evt.pageX - downX
    const _y = evt.pageY - downY
    if (position.indexOf('left') > -1 && (initW - _x) > 200) {
      el.style.left = initX + _x + 'px'
      el.style.width = initW - _x + 'px'
    }
    if (position.indexOf('right') > -1 && (initW + _x) > 200) {
      el.style.width = initW + _x + 'px'
    }
    if (position.indexOf('top') > -1 && (initH - _y) > 200) {
      el.style.top = initY + _y + 'px'
      el.style.height = initH - _y + 'px'
    }
    if (position.indexOf('bottom') > -1 && (initH + _y) > 200) {
      el.style.height = initH + _y + 'px'
    }
  }
  resizer.addEventListener('mousedown', evt => {
    isDown = true
    downX = evt.pageX
    downY = evt.pageY
    initX = el.offsetLeft
    initY = el.offsetTop
    initW = el.offsetWidth
    initH = el.offsetHeight
  })
  document.addEventListener('mouseup', resetStatus)
  document.addEventListener('mousemove', moveFunc)
  return () => {
    document.removeEventListener('mouseup', resetStatus)
    document.removeEventListener('mousemove', moveFunc)
  }
}

function setResizerSelf (resizer, position) {
  if (position === 'left') {
    resizer.style.width = '5px'
    resizer.style.height = 'calc(100% - 10px)'
    resizer.style.left = 0
    resizer.style.top = '5px'
    resizer.style.cursor = 'e-resize'
  }
  if (position === 'right') {
    resizer.style.width = '5px'
    resizer.style.height = 'calc(100% - 10px)'
    resizer.style.right = 0
    resizer.style.top = '5px'
    resizer.style.cursor = 'e-resize'
  }
  if (position === 'top') {
    resizer.style.width = 'calc(100% - 10px)'
    resizer.style.height = '5px'
    resizer.style.left = '5px'
    resizer.style.top = 0
    resizer.style.cursor = 'n-resize'
  }
  if (position === 'bottom') {
    resizer.style.width = 'calc(100% - 10px)'
    resizer.style.height = '5px'
    resizer.style.left = '5px'
    resizer.style.bottom = 0
    resizer.style.cursor = 'n-resize'
  }
  if (position === 'top-left') {
    resizer.style.width = '5px'
    resizer.style.height = '5px'
    resizer.style.left = 0
    resizer.style.top = 0
    resizer.style.cursor = 'nw-resize'
  }
  if (position === 'top-right') {
    resizer.style.width = '5px'
    resizer.style.height = '5px'
    resizer.style.right = 0
    resizer.style.top = 0
    resizer.style.cursor = 'ne-resize'
  }
  if (position === 'bottom-left') {
    resizer.style.width = '5px'
    resizer.style.height = '5px'
    resizer.style.left = 0
    resizer.style.bottom = 0
    resizer.style.cursor = 'ne-resize'
  }
  if (position === 'bottom-right') {
    resizer.style.width = '5px'
    resizer.style.height = '5px'
    resizer.style.right = 0
    resizer.style.bottom = 0
    resizer.style.cursor = 'nw-resize'
  }
}

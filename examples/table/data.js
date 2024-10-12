export const data = new Array(3003).fill(0).map((m, i) => ({
  userId: '123',
  username: 'zhangsan',
  userCnName: '张三',
  password: '******',
  deptId: '123',
  phone: '133****4566',
  roleList: [],
  lockFlag: i
}))

export const data2 = new Array(3).fill(0).map((m, i) => ({
  userId: '456',
  username: 'lisi',
  userCnName: '李四',
  password: '******',
  deptId: '456',
  phone: '155****6788',
  roleList: [],
  lockFlag: i
}))

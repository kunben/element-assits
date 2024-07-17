export const column = [
  {
    label: 'id',
    prop: 'userId'
  },
  {
    label: '用户名',
    prop: 'username'
  },
  {
    label: '用户中文名',
    labelTooltip: '昵称',
    prop: 'userCnName'
  },
  {
    label: '密码',
    labelTooltip: () => ({
      content: '如无需修改密码，请勿更改此项',
      placement: 'top'
    }),
    prop: 'password'
  },
  {
    label: '所属部门',
    prop: 'deptId'
  },
  {
    label: '手机号',
    prop: 'phone'
  },
  {
    label: '角色',
    prop: 'roleList'
  },
  {
    label: '状态',
    prop: 'lockFlag',
    component: 'el-switch'
  }
]

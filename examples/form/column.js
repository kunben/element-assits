export const column = [
  {
    label: 'userId',
    prop: 'userId'
  },
  {
    label: '用户名',
    prop: 'username',
    bind: {
      placeholder: '123123123123yonghuming'
    }
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
    prop: 'phone',
    show: theForm => theForm.lockFlag
  },
  {
    label: '角色',
    prop: 'roleList',
    enable: theForm => theForm.lockFlag
  },
  {
    label: '状态',
    prop: 'lockFlag',
    component: 'el-switch'
  },
  {
    title: '其它',
    children: [
      { label: 'A', prop: 'A' },
      { label: 'B', prop: 'B' },
      { label: 'C', prop: 'C' },
      { label: 'D', prop: 'D' }
    ]
  }
]

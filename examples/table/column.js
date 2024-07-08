export const searchColumn = [
  {
    label: '所属部门',
    prop: 'deptId',
    component: 'EaSelect',
    bind: {
      props: { desc: 'desc' },
      filterable: true,
      data: new Array(1000).fill(0).map((m, i) => ({
        label: '某某银行' + i,
        value: i,
        desc: '比较长的描述' + i
      }))
    }
  },
  {
    label: '用户名',
    prop: 'username'
  },
  {
    label: '用户中文名',
    prop: 'userCnName'
  },
  {
    label: '密码',
    prop: 'password'
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
    prop: 'lockFlag'
  }
]
export const column = [
  {
    label: 'id',
    prop: 'userId',
    key: 0,
    show: false
  },
  {
    label: '用户名',
    prop: 'username'
  },
  {
    label: '用户中文名',
    prop: 'userCnName'
  },
  {
    label: '密码',
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

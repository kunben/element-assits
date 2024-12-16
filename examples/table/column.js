import { renderCell } from '../../src'

export const searchColumn = [
  {
    label: '所属部门',
    prop: 'deptId',
    component: 'EaSelect',
    bind: form => ({
      props: { desc: 'desc' },
      filterable: true,
      showCheckAll: true,
      multiple: true,
      data: new Array(1000).fill(0).map((m, i) => ({
        label: '某某银行' + i,
        value: i,
        desc: '比较长的描述' + i
      }))
      // asyncParams: form.username,
      // asyncData: (p) => {
      //   console.log('run asyncData', p)
      //   if (p === '1') return Promise.resolve([])
      //   return new Array(1000).fill(0).map((m, i) => ({
      //     label: '某某银行' + i,
      //     value: i,
      //     desc: '比较长的描述' + i
      //   }))
      // }
    }),
    on: {
      'obj-change': evt => {
        console.log(evt)
      }
    }
  },
  {
    label: '用户名',
    prop: 'username'
  },
  {
    label: '日期',
    prop: 'date',
    exclusiveDoubleCells: true
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

const statusList = [
  { label: '第零个', value: 0 },
  { label: '第一个', value: 1 }
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
    render: renderCell(statusList, true)
  }
]

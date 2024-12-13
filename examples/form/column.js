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
    component: 'el-switch',
    bind: { style: 'height: 32px' }
  },
  {
    label: '爱好1',
    labelTooltip: '当不使用props.desc时，隐式的以value属性搜索',
    prop: 'hobby1',
    component: 'EaSelect',
    bind: {
      clearable: true,
      filterable: true,
      data: [
        { label: '打球', value: '1', desc: 'play ball' },
        { label: '钓鱼', value: '2', desc: 'fishing' },
        { label: '骑行', value: '3', desc: 'ride' },
        { label: '徒步', value: '4', desc: 'on foot' },
        { label: '登山', value: '5', desc: 'mountaineering' }
      ]
    }
  },
  {
    label: '爱好2',
    labelTooltip: '当使用props.desc时，隐式的以desc属性搜索',
    prop: 'hobby2',
    component: 'EaSelect',
    bind: {
      clearable: true,
      filterable: true,
      props: { desc: 'desc' },
      data: [
        { label: '打球', value: '1', desc: 'play ball' },
        { label: '钓鱼', value: '2', desc: 'fishing' },
        { label: '骑行', value: '3', desc: 'ride' },
        { label: '徒步', value: '4', desc: 'on foot' },
        { label: '登山', value: '5', desc: 'mountaineering' }
      ]
    }
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

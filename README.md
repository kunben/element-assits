# [element-assits](https://github.com/kunben/element-assits)

## 介绍
element-ui 为了适用范围更广，组件灵活性很高。在实际的业务开发过程中，需要对其进行适当的封装以适应项目并提高开发效率。  

此项目扩展了 element-ui 的表格和表单组件，使其在多表格和表单的项目中更易于使用。

## 快速开始
安装：  
`npm i element-assits -S` (确保已经安装了`vue` 和 `element-ui`)

引入：  
```
// 入口文件 main.js
import Vue from 'vue'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ElementAssits from 'element-assits'
import 'element-assits/lib/style.scss'

Vue.use(Element)
Vue.use(ElementAssits)
// ...
```
使用：  
默认全局注册了 `EaForm` `EaTable` `EaSelect` `EaModal` `EaPopover` 等组件  
提供了 `uuid` `recursive` 两个工具函数  
Vue 原型上挂载了 `$asyncLoad` 方法  
> 如果单独引入 asyncLoad 方法，并且没有挂载在Vue原型上  
> 那么，asyncLoad 方法载入的组件将游离在vueApp实例树之外  
> 副作用是无法访问$parent,$router,$store等等  
> 除非你 asyncLoad.bind(this) 手动为其绑定上下文


## 用法

### 表格组件 EaTable
此组件扩展了 el-table 组件。不同的是：
- 它完全使用对象数组来控制表格列
- 封装了搜索栏，动态宽度，动态折叠等
- 封装了分页组件，自动分页
- 各个位置留有菜单栏插槽，合理布局

## props
| 属性名 | 含义 | 类型 | 默认值 |
|:---|:---|:---|:---|
| column | 列信息数组| Array | [] |
| data | 表格数据 | Array | [] |
| pageRequest | 分页请求 | Function | undefined |
| loading | 表格加载状态 | Boolean | undefined |
| initRequest | 是否初始化发送请求 | Boolean | true |
| innerForm | 内部 - 表单（搜索栏） | Boolean \| Object | undefined |
| innerForm.limit|限制默认显示的搜索条件数量|Number \| auto \| all|auto|
| innerForm.referenceItemWidth|单项参考宽度|Number|180|
| innerForm.maxItemWidth|单项最大宽度|Number|240|
| innerForm.loading|控制更多按钮加载状态|Boolean|false|
| innerForm.column[].exclusiveDoubleCells|允许某一项独占两格|Boolean|false|
| innerIndex | 内部 - 索引 | Boolean \| Object | true|
| innerSelection | 内部 - 选中列 | Boolean \| Object | undefined|
| innerSelection.data|选中的行|Array| [] |
| innerPagination | 内部 - 分页 | Boolean \| Object | undefined|
| innerOperation | 内部 - 操作栏（尾列）| Boolean \| Object | undefined|
| innerOperation.maxNumOfBtn|最大显示的按钮数，溢出折叠|Number|3|

## methods

| 方法名 | 说明 | 参数 |
|:---|:---|:---|
| handleSearch | 执行搜索 | 无 |
| handleRefresh | 执行刷新 | 无 |


## slots
| 插槽名  | 默认值 | 说明 |
|:---|:---|:---|
| table | 表格 | 如果不想用表格来渲染数据，此处可自定义渲染数据的方式
| top-menu | 无 | 顶部菜单
| row-menu | 无 | 行菜单，需要 initOperation 至少为true
| bottom-menu | 无 | 底部菜单
| before-column | 无 | 表格内部列之前
| after-column | 无 | 表格内部列之后
| footer | bottom-menu&分页 | 表格底部

## events
| 事件名  | 说明 | 参数 |
|:---|:---|:---|
|search-reset| 搜索重置事件|callback 重置表单并搜索（不监听时默认行为） <br> reset 仅重置表单<br> search 仅搜索 |

## column-attributes
| 属性名 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| label | String | undefined | 列名
| prop | String | undefined | 列属性名
| show | Boolean | undefined | 是否显示，非 false 即显示
| bind | Object | undefined | v-bind 至对应的 el-table-column 组件

---

### 表单组件 EaForm

## props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|model|表单数据对象|Object|
|rules|表单验证规则对象|Object|
|dense|是否紧凑模式|Boolean|false|
|column|表单项信息组|Array|必填|
|column[].label|标签名|String \| Function|必填|
|column[].prop|属性名|String|必填|
|column[].labelTooltip|名称描述tips|String \| Object|
|column[].required|是否必填|Boolean|false|
|column[].component|所用组件|String \| Component|el-input|
|column[].rules|校验规则|Array \| Function|
|column[].bind|组件v-bind|Object|
|column[].on|组件v-on|Object|
|column[].show|控制表单项是否显示|Boolean \| Function|true|
|column[].enable|控制表单项是否启用|Boolean \| Function|true|
|column[].span|所占栅格|Number|12|
|column[].pull|栅格偏移|Number|
|column[].push|栅格偏移|Number|
|column[].offset|栅格偏移|Number|
## methods
| 方法 | 说明 | 参数 |
|:---|:---|:---|
|setData|设置表单数据对象的值|要设置的数据对象|

### 按钮 EaButton
```
props: {
  customType: { type: String, default: undefined },
  tooltip: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  feat: { type: String, default: undefined },
  type: { type: String, default: undefined },
  icon: { type: String, default: undefined }
}
// 示例
<EaButton feat="primary|el-icon-plus|添加" />
```
### 弹窗 EaModal
```
// 允许拖拽，允许少量修改布局，简化按钮
// 绑定confirm事件，出现确定按钮
// 绑定cancel事件，出现取消按钮
props: {
  customClass: { type: String, default: undefined },
  confirmLoading: { type: Boolean, default: false },
  margin: { type: String, default: undefined },
  bodyPadding: { type: String, default: undefined },
  bodyMinHeight: { type: String, default: undefined },
  allowDrag: { type: Boolean, default: true }
}
```
### 数字输入框 EaNumber
```
// 定制样式
```

### 气泡框 EaPopover
```
// 函数式Popover，允许异步调用
```

### 单选框 EaRadio
```
// 允许绑定数据和异步数据，允许默认选中
props: {
  data: { type: Array, default: undefined },
  asyncData: { type: Function, default: undefined },
  props: { type: Object, default: undefined },
  defaultFirst: { type: Boolean, default: false },
  innerRadio: { type: Object, default: undefined },
  type: { type: String, default: undefined }
},
```

### 开关 EaSwitch
额外支 size="mini" 尺寸

### 滚动容器 EaScroll
```
// el-scrollbar 衍生，优化样式
props: {
  wrapStyle: { type: String, default: '' }
},
```

### 虚拟滚动 EaVirtualScroll

## props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|enableVirtualScroll|是否开启虚拟滚动|Boolean \| String|auto|
|options|选项列表|Array| [] |
|itemSize|单项高度|Number|30|
|redundancy|渲染总数，影响流畅度|Number|60|

### JsonSchema编辑器 EaJsonSchema

## props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|value / v-model|json-schema 数据|Object|{}|
|height|组件高度|Number \| String| auto |
|maxHeight|当自动高度时，限制最大高度|Number| 500 |
|itemSize|单项高度|Number|32|
|allowEdit|是否允许编辑|Boolean|true|
|checkbox|是否开启多选列|Boolean|false|

## methods
| 方法名 | 说明 | 参数 |
|:---|:---|:---|
| validate | 数据验证，仅验证prop不能为空 | 无 |
| getData | 获取数据（配置结果） | 无 |


### 下拉框 EaSelect
```
// 允许异步数据，允许大数据量虚拟滚动
props: {
  value: { type: [String, Array, Number], default: undefined },
  label: { type: String, default: undefined },
  data: { type: Array, default: () => [] },
  asyncParams: undefined,
  asyncData: { type: Function, default: undefined },
  props: { type: Object, default: undefined },
  itemMaxWidth: { type: [Number, Array], default: 150 },
  popperClass: { type: String, default: undefined }
},
```

### 分割面板 EaSplit
```
// 分割面板，允许拖拽
props: {
  default: { type: Number, default: 0.2 },
  min: { type: Number, default: 0.2 },
  max: { type: Number, default: 0.5 }
},
<slot name="left" />
<slot name="center" />
<slot name="right" />
```

### 树 EaTree
```
// 与el-tree相比，带搜索框和搜索方法，带scrollbar，允许设置剩余高度，异步数据
props: {
  inputPlaceholder: {
    type: String,
    default: '请输入关键字搜索'
  },
  remainingHeight: {
    type: Number,
    default: 200
  },
  props: {
    type: Object,
    default: undefined
  },
  data: {
    type: Array,
    default: undefined
  },
  asyncData: {
    type: Function,
    default: undefined
  },
  filterNodeMethod: {
    type: Function,
    default: undefined
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  }
},
```

### 列表 EaList
```
// 允许pageRequest分页无限滚动，允许虚拟滚动，允许剩余高度
props: {
  data: { type: Array, default: undefined },
  pageRequest: { type: Function, default: undefined },
  initRequest: { type: Boolean, default: true },
  itemSize: { type: Number, default: 30 },
  remainingHeight: { type: Number, default: 200 },
  page: { type: Object, default: undefined },
  redundancy: { type: Number, default: undefined }
},
```

### 描述列表 EaDesc

## props
| 属性名 | 含义 | 类型 | 默认值 |
|:---|:---|:---|:---|
|title|标题|String|undefined|
|data|数据|Object|必填|
|column|列信息|Array|必填|
|column[].bind.class|单独设置类|Object|undefined|
|column[].bind.style|单独设置样式|Object|undefined|
|labelWidth|标签宽度|Number \| String|100|
|split|分割数量|Number|2|
|diff|有差异的列信息|Array|undefined|
|gutter|间隔|Number|0|

### 弹窗文件上传 EaFileUpload

## props
| 属性名 | 含义 | 类型 | 默认值 |
|:---|:---|:---|:---|
|title|标题|String|文件上传|
|multiple|是否多选|Boolean|false|
|limit|最大数量限制|Number|1|
|suffix|允许的文件后缀|String|xlsx,xls|
|httpRequest|文件上传|Function|必填|
|httpTemplate|模板下载|Function|undefined|
|httpFinally|请求完成|Function|undefined|

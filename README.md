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
Vue.use(ElementAssits, {
  components: true, // 是否全局注册所有组件，默认true
  isNilCellText: undefined // 当表格和描述列表单元格为undefined或null时的替代字符
})
// ...
```
使用：  
默认全局注册了 `EaForm` `EaTable` `EaSelect` `EaModal` `EaPopover` 等组件  
提供了 `uuid` `recursive` `recursiveFilter` `asyncLoad` `renderCell` 五个工具函数  
Vue 原型上挂载了 `$asyncLoad` 方法（与asyncLoad相同）  
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
#### props
| 属性名 | 含义 | 类型 | 默认值 |
|:---|:---|:---|:---|
| column | 列信息数组| Array | [] |
| data | 表格数据 | Array | [] |
| pageRequest | 分页请求 | Function <br>() => Promise<{data:any[], total:number}> | undefined |
| loading | 表格加载状态 | Boolean | undefined |
| initRequest | 是否初始化发送请求 | Boolean \| Function <br> boolean \| (search: () => void) => void | true |
| isNilCellText | 当单元格内容为空时的替代字符 | String \| Boolean | undefined |
| innerForm | 内部 - 表单（搜索栏） | Boolean \| Object | undefined |
| &nbsp;&nbsp;&nbsp;&nbsp;.model | 搜索表单的值 | Object | undefined |
| &nbsp;&nbsp;&nbsp;&nbsp;.limit|限制默认显示的搜索条件数量|Number \| auto \| all|auto|
| &nbsp;&nbsp;&nbsp;&nbsp;.referenceItemWidth|单项参考宽度|Number|180|
| &nbsp;&nbsp;&nbsp;&nbsp;.maxItemWidth|单项最大宽度|Number|240|
| &nbsp;&nbsp;&nbsp;&nbsp;.loading|控制更多按钮加载状态|Boolean|false|
| &nbsp;&nbsp;&nbsp;&nbsp;.defaultShowAll|搜索条件是否默认展开|Boolean|false|
| &nbsp;&nbsp;&nbsp;&nbsp;.column[].exclusiveDoubleCells|允许某一项独占两格|Boolean|false|
| innerSelection | 内部 - 选中列 | Boolean \| Object | undefined|
| &nbsp;&nbsp;&nbsp;&nbsp;.data | 选中的行 | Array | undefined |
| innerIndex | 内部 - 索引 | Boolean \| Object | true|
| innerPagination | 内部 - 分页 | Boolean \| Object | undefined|
| innerOperation | 内部 - 操作栏（尾列）| Boolean \| Object | undefined|
| &nbsp;&nbsp;&nbsp;&nbsp;.maxNumOfBtn|最大显示的按钮数，溢出折叠|Number|3|
| &nbsp;&nbsp;&nbsp;&nbsp;.enableAutoWidth|是否自动计算宽度（当按钮动态时）|Boolean|true|

#### methods
| 方法名 | 说明 | 参数 |
|:---|:---|:---|
| handleSearch | 执行搜索 | 无 |
| handleRefresh | 执行刷新 | 无 |
#### slots
| 插槽名  | 默认值 | 说明 |
|:---|:---|:---|
| search | 搜索栏 | 如果想自定义搜索栏时
| table | 表格 | 如果不想用表格来渲染数据，此处可自定义渲染数据的方式
| top-menu | 无 | 顶部菜单
| row-menu | 无 | 行菜单，需要 initOperation 至少为true
| bottom-menu | 无 | 底部菜单
| before-column | 无 | 表格内部所有列之前
| after-index-column | 无 | 表格内部索引列之后
| after-selection-column | 无 | 表格多选列之后
| before-action-column | 无 | 表格内部操作列之前
| after-column | 无 | 表格内部所有列之后
| footer | bottom-menu&分页 | 表格底部
#### events
| 事件名  | 说明 | 参数 |
|:---|:---|:---|
|search-reset| 搜索重置事件|params.callback 重置表单并搜索（不监听时默认行为） <br> params.reset 仅重置表单<br> params.search 仅搜索 |
#### column-attributes
| 属性名 | 类型 | 默认值 | 说明 |
|:---|:---|:---|:---|
| label | String | undefined | 列名
| prop | String | undefined | 列属性名
| show | Boolean | undefined | 是否显示，非 false 即显示
| bind | Object | undefined | v-bind 至对应的 el-table-column 组件
| isNilCellText | String \| Boolean | undefined | 当单元格内容为空时的替代字符

### 表单组件 EaForm
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|model|表单数据对象|Object|
|rules|表单验证规则对象|Object|
|dense|是否紧凑模式|Boolean|false|
|column|表单项信息组|Array|必填|
|column[].label|标签名|String \| Function|必填|
|column[].prop|属性名|String|必填|
|column[].labelTooltip|名称描述tips|String \| Object|
|column[].labelWidth|独立设置标签宽度|String|
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
#### methods
| 方法 | 说明 | 参数 |
|:---|:---|:---|
|setData|设置表单数据对象的值|要设置的数据对象|
#### events
| 事件名  | 说明 | 参数 |
|:---|:---|:---|
|change| 表单值变化事件 | 当前表单的值 |

### 按钮 EaButton
继承el-button, 简化按钮配置
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|customType|自定义类型，将启用小方格按钮|String|undefined|
|tooltip|按钮提示文本，为空则禁用|String|undefined|
|feat|按钮配置简写<br>例如：feat="primary\|el-icon-plus\|新增"|String|undefined|

### 弹窗 EaModal
继承 el-dialog，允许拖拽，允许少量修改布局，简化按钮  
绑定confirm事件，出现确定按钮；绑定cancel事件，出现取消按钮
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|customClass|自定义css类|String|undefined|
|confirmLoading|确定按钮的加载状态|Boolean|false|
|margin|弹窗 margin|String|undefined|
|bodyPadding|内容 padding|String|undefined|
|bodyMinHeight|内容最小高度|String|undefined|
|allowDrag|是否允许拖拽|Boolean|true|
|confirmText|确定按钮文本|String|'确定'|
|cancelText|取消按钮文本|String|'取消'|

### 抽屉 EaDrawer
继承 el-drawer，允许少量修改布局，简化按钮  
绑定confirm事件，出现确定按钮；绑定cancel事件，出现取消按钮
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|customClass|自定义css类|String|undefined|
|confirmLoading|确定按钮的加载状态|Boolean|false|
|width|抽屉宽度|String|'720px'|
|bodyPadding|内容 padding|String|'20px'|
|headerHeight|标题高度|String|'70px'|
|footerHeight|底部高度|String|'70px'|
|confirmText|确定按钮文本|String|'确定'|
|cancelText|取消按钮文本|String|'取消'|

### 数字输入框 EaNumber
使样式与 el-input 相似

### 气泡框 EaPopover
函数式Popover，允许异步调用
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|reference|参考dom节点|HTMLElement|undefined|
|offset|偏移|Number|0|
|mountedCallback|加载后回调，方便使用|Function|undefined|
#### slots
| 插槽名  | 默认值 | 说明 |
|:---|:---|:---|
| default | 无 | 内容插槽 <br> (refresh, close) 允许刷新和关闭气泡框 |

### 单选框 EaRadio
允许绑定数据和异步数据，允许默认选中
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|data|数据|Array|undefined|
|asyncData|异步数据|Function|undefined|
|props|配置选项|Object|undefined|
|defaultFirst|是否默认选中第一项|Boolean|false|
|innerRadio|绑定至内部-radio|Object|undefined|
|type|radio类型|String|undefined|

### 开关 EaSwitch
额外支 size="mini" 尺寸

### 滚动容器 EaScrollbar
el-scrollbar 衍生，优化样式
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|wrapStyle|wrap样式|String|undefined|

### 虚拟滚动 EaVirtualScroll
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|enableVirtualScroll|是否开启虚拟滚动|Boolean \| String|auto|
|options|选项列表|Array| [] |
|itemSize|单项高度|Number|30|
|redundancy|渲染总数，影响流畅度和性能|Number|60|

### JsonSchema编辑器 EaJsonSchema
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|value / v-model|json-schema 数据|Object|{}|
|height|组件高度|Number \| String| auto |
|maxHeight|当自动高度时，限制最大高度|Number| 500 |
|itemSize|单项高度|Number|32|
|allowEdit|是否允许编辑|Boolean|true|
|checkbox|是否开启多选列|Boolean|false|
|disableCheckbox|是否禁用选择（只读）|Boolean|false|
|columnFormat|对原有的column进行过滤|Function|column => column|
|rootAlias|根节点别名|String|root|
|advancedConfChunk|高级配置构造函数回调，可自由设置高级配置表单|Function|undefined|
#### methods
| 方法名 | 说明 | 参数 |
|:---|:---|:---|
| validate | 数据验证，仅验证prop不能为空 | 无 |
| getData | 获取数据（配置结果） | 无 |
| getChecked | 获取选中项 | 无 |
| setChecked | 设置选中项 | 选中项schema路径列表 |
| getSchemaPath | 获取schema路径 | __state.prefix |
| getDataPath | 获取data路径 | __state.prefix, callback |


### 下拉框 EaSelect
允许异步数据，允许大数据量虚拟滚动
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|value / v-model|绑定值|String \| Number \| Array|undefined|
|label|额外名称绑定，允许.sync|String|undefined|
|data|选项数据|Array|[]|
|asyncParams|异步参数|undefined|undefined|
|asyncData|异步数据，允许异步参数|Function|undefined|
|props|配置选项|Object|undefined|
|props.desc|描述列字段名，将影响过滤方法|String|undefined|
|itemMaxWidth|单项[label,value]最大宽度|Number \| Array|150|
|popperClass|弹出框自定义css类|String|undefined|
|showCheckAll|多选时是否显示全选按钮|Boolean|false|
#### slots
| 插槽名  | 默认值 | 说明 |
|:---|:---|:---|
| prefix | 无 | 输入框前缀 |
| empty | 无 | 空数据 |
| before-option | 无 | 选项之前 |
| after-option | 无 | 选项之后 |

### 分割面板 EaSplit
分割面板，允许拖拽
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|default|默认分割比例|Number|0.2
|min|最小分割比例|Number|0.2
|max|最大分割比例|Number|0.5
#### slots
| 插槽名  | 默认值 | 说明 |
|:---|:---|:---|
| left | 无 |左侧面板|
| center | 默认手柄 |中间分割手柄 |
| right | 无 |右侧面板 |

### 树 EaTree
与el-tree相比，带搜索框和搜索方法，带scrollbar，允许设置剩余高度，异步数据
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|inputPlaceholder|搜索框的占位内容|String|请输入关键字搜索|
|remainingHeight|剩余高度|Number|200|
|props|配置选项|Object|undefined|
|data|数据|Array|undefined|
|asyncData|异步数据|Function|undefined|
|filterNodeMethod|过滤方法|Function|undefined|
|emptyText|空数据时文字描述|String|暂无数据|
|title|标题|String|undefined|
|border|是否显示边框|Boolean|false|
#### slots
| 插槽名  | 默认值 | 说明 |
|:---|:---|:---|
| default | 无 |自定义树节点的内容，参数为 { node, data }|
| input-prefix | 无  |搜索框前缀|
| input-append | 无 |搜索框后缀|
| header | 无 |自定义标题|
| header-append | 无 |自定义标题后缀|

### 虚拟树 EaDataTree
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|data|(树)数据|Array|[]|
|props|配置项|Object|见下文|
|&nbsp;&nbsp;&nbsp;&nbsp;props.label|显示名称|String|label|
|&nbsp;&nbsp;&nbsp;&nbsp;props.value|实际值|String|value|
|&nbsp;&nbsp;&nbsp;&nbsp;props.children|子集|String|children|
|&nbsp;&nbsp;&nbsp;&nbsp;props.hasChildren|手动指定是否含有子集<br>配合 loadMethod 使用|String|undefined|
|height|组件高度|Number \| String| auto |
|maxHeight|当自动高度时，限制最大高度|Number| 500 |
|itemSize|单项高度|Number|32|
|redundancy|渲染总数，影响流畅度和性能|Number|60|
|checkbox|是否显示多选框|Boolean|false|
|disableCheckbox|是否禁止多选框|Boolean|false|
|noDataText|无数据时的文本|String|暂无数据|
|loadMethod|展开节点时异步加载的方法|Function<br> () => Promise\<any[]\>|undefined|
|rowKey|行唯一key|String|props.value|
|border|是否显示边框|Boolean|false|
|stripe|是否需要斑马纹|Boolean|false|
#### methods
| 方法名 | 说明 | 参数 |
|:---|:---|:---|
| getChecked | 获取选中项 | 无 |
| setChecked | 设置选中项 | (树)数据（以`props.value`匹配） |
| setCheckedKeys | 设置选中项 | rowKey: string[]（以`rowKey`匹配）, state: boolean |
| filter | 过滤树 | keyword:string 或 callback: () => boolean |
#### events
| 事件名  | 说明 | 参数 |
|:---|:---|:---|
|selection-change|选中项变化|:---|
|expand| 操作展开收起时 | 操作的节点(node) |
|expanded| 操作展开收起后 | 操作的节点(state, node, isAsync, data) |
#### slots
| 插槽名  | 默认值 | 说明 |
|:---|:---|:---|
| default | 单项（行） | 自定义行内容，跟随枝干 |
| row | 单项（行） | 自定义行内容，脱离枝干 |

### 列表 EaList
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|data|数据|Array|undefined|
|pageRequest|分页请求|Function|undefined|
|initRequest|是否初始化请求|Boolean|true|
|itemSize|单项高度|Number|30|
|remainingHeight|剩余高度|Number|200|
|page|分页信息|Object|undefined|
|redundancy|渲染总数，影响流畅度和性能|Number|60|
#### slots
| 插槽名  | 默认值 | 说明 |
|:---|:---|:---|
| default | 单项（行） | 自定义行内容 |

### 虚拟数据表格 EaDataTable
#### props
| 属性名 | 说明 | 类型 | 默认值 |
|:---|:---|:---|:---|
|data|数据|Array|undefined|
|column|列信息|Array|undefined|
|pageRequest|分页请求|Function|undefined|
|initRequest|是否初始化请求|Boolean|true|
|itemSize|单项高度|Number|30|
|maxHeight|最大高度|Number|300|
|page|分页信息|Object|undefined|
|redundancy|渲染总数，影响流畅度和性能|Number|undefined|
|border|是否显示边框|Boolean|false|


### 描述列表 EaDesc
#### props
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
|isNilCellText|当单元格内容为空时的替代字符|String\|Boolean|undefined|

### 弹窗文件上传 EaFileUpload
#### props
| 属性名 | 含义 | 类型 | 默认值 |
|:---|:---|:---|:---|
|title|标题|String|文件上传|
|multiple|是否多选|Boolean|false|
|limit|最大数量限制|Number|1|
|suffix|允许的文件后缀|String|xlsx,xls|
|maxSize|允许的文件大小，单位M|Number|100|
|httpRequest|文件上传|Function|必填|
|httpTemplate|模板下载|Function|undefined|
|httpFinally|请求完成|Function|undefined|
|innerUploadBind|绑定至el-upload|Object|undefined|
|innerUploadOn|绑定至el-upload|Object|undefined|

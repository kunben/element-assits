import Vue from 'vue'
import type { DefineComponent, CreateElement, VNode } from 'vue'
import type { EaFormColumn } from './EaForm'

interface Page {
  current: number;
  pageSize: number;
  total: number;
}

interface ElTableColumn {
  /** column 的 key，如果需要使用 filter-change 事件，则需要此属性标识是哪个 column 的筛选条件 */
  columnKey?: string
  /** 显示的标题 */
  label?: string
  /** 对应列内容的字段名，也可以使用 property 属性 */
  prop?: string
  /** 对应列的宽度 */
  width?: string | number
  /** 对应列的最小宽度，与 width 的区别是 width 是固定的，min-width 会把剩余宽度按比例分配给设置了 min-width 的列 */
  minWidth?: string | number
  /** 列是否固定在左侧或者右侧，true 表示固定在左侧 */
  fixed?: boolean | 'left' | 'right'
  /** 列标题 Label 区域渲染使用的 Function */
  renderHeader?: (h: CreateElement, param: { column: unknown, $index: number }) => VNode
  /** 对应列是否可以排序，如果设置为 'custom'，则代表用户希望远程排序，需要监听 Table 的 sort-change 事件，默认值 `false` */
  sortable?: boolean | 'custom'
  /** 对数据进行排序的时候使用的方法，仅当 sortable 设置为 true 的时候有效，需返回一个数字，和 Array.sort 表现一致 */
  sortMethod?: (a: unknown, b: unknown) => number
  /** 指定数据按照哪个属性进行排序，仅当 sortable 设置为 true 且没有设置 sort-method 的时候有效。如果 sort-by 为数组，则先按照第 1 个属性排序，如果第 1 个相等，再按照第 2 个排序，以此类推 */
  sortBy?: string | string[] | ((row: unknown, index: number) => unknown)
  /** 数据在排序时所使用排序策略的轮转顺序，仅当 sortable 为 true 时有效。需传入一个数组，随着用户点击表头，该列依次按照数组中元素的顺序进行排序，默认值 `['ascending', 'descending', null]` */
  sortOrders?: Array<'ascending' | 'descending' | null>
  /** 对应列是否可以通过拖动改变宽度（需要在 el-table 上设置 border 属性为真），默认值 `true` */
  resizable?: boolean
  /** 用来格式化内容 */
  formatter?: (row: unknown, column: unknown, cellValue: unknown, index: number) => unknown
  /** 当内容过长被隐藏时显示 tooltip，默认值 `false` */
  showOverflowTooltip?: boolean
  /** 对齐方式，可选值为 `left`、`center`、`right`，默认值 `left` */
  align?: 'left' | 'center' | 'right'
  /** 表头对齐方式，若不设置该项，则使用表格的对齐方式，可选值为 `left`、`center`、`right` */
  headerAlign?: 'left' | 'center' | 'right'
  /** 列的 className */
  className?: string
  /** 当前列标题的自定义类名 */
  labelClassName?: string
  /** 仅对 type=selection 的列有效，类型为 Function，Function 的返回值用来决定这一行的 CheckBox 是否可以勾选 */
  selectable?: (row: unknown, index: number) => boolean
  /** 仅对 type=selection 的列有效，类型为 Boolean，为 true 则会在数据更新之后保留之前选中的数据（需指定 row-key），默认值 `false` */
  reserveSelection?: boolean
  /** 数据过滤的选项，数组格式，数组中的元素需要有 text 和 value 属性。 */
  filters?: Array<{ text: string, value: unknown }>
  /** 过滤弹出框的定位，与 Tooltip 的 placement 属性相同 */
  filterPlacement?: string
  /** 数据过滤的选项是否多选，默认值 `true` */
  filterMultiple?: boolean
  /** 数据过滤使用的方法，如果是多选的筛选项，对每一条数据会执行多次，任意一次返回 true 就会显示。 */
  filterMethod?: (value: unknown, row: unknown, column: unknown) => boolean
  /** 选中的数据过滤项，如果需要自定义表头过滤的渲染方式，可能会需要此属性。 */
  filteredValue?: unknown[]
}

export interface EaTableColumn {
  /** 列名 */
  label: string;
  /** 列字段 */
  prop: string;
  /** key */
  key?: string;
  /** 是否显示此列，默认显示 */
  show?: boolean;
  /** 排序 */
  sort?: number;
  /** v-bind 绑定到 el-table-column 的属性 */
  bind?: ElTableColumn;
  /** 单元格渲染函数，如果需要自定义单元格 */
  render?: (h: CreateElement, context: {
    row: Record<string, unknown>;
    column: unknown;
    value: unknown;
    _column: EaTableColumn;
    that: unknown;
    hideRefresh: () => void;
  }) => VNode;
}

export interface EaTableProps {
  /**
   * 表格数据  
   * - 可自行传入全量数据，将自动分页。  
   * - 如果关闭分页，则会全量展示（大数据量可能卡死）。  
   * - 可不传，转而使用pageRequest, 自动异步分页查询。  
   * - 当传入pageRequest时，data将被忽略。
   */
  data?: Record<string, unknown>[];
  /** 表格列信息集合，暂不支持多级表头 */
  column: EaTableColumn[];
  /** 从外部控制表格加载效果，不传则由内部控制 */
  loading?: false;
  /** 是否显示每一列的更多控制菜单，默认显示 */
  columnControl?: boolean;
  /** 表格分页请求 */
  pageRequest?: (pager: Page, sform: Record<string, unknown>) => Promise<{
    data: unknown[],
    total: number
  }>;
  /** 初始化时，是否自动查询，默认为 true; 可传入一个回调，回调的参数为查询动作，可自由决定何时初始化查询 */
  initRequest?: boolean | ((doSearch: () => void) => void);
  /** 是否使用紧凑型表格，默认为 false；设置为true，单元格高度将被改为32px */
  dense?: boolean;
  /**
   * 整个表格中的单元格的值为 null 和 undefined 时的替代字符;  
   * - 权重高于全局配置的 isNilCellText;  
   * - 低于表格列级配置的 isNilCellText
   */
  isNilCellText?: string | undefined;
  /** 内部 - 搜索表单; 默认 false */
  innerForm?: boolean | {
    /**
     * 是否显示表格顶部的搜索表单  
     * 只要innerForm传入一个真值，它即为真，除非显式的指定其值为false
     */
    show?: boolean | undefined;
    /** 搜索表单的列信息集合 */
    column?: EaFormColumn[];
    /** 搜索表单的值，可指定一个响应式对象 */
    model?: Record<string, unknown>;
    [x: string]: unknown;
  };
  /** 内部 - 索引列; 默认 true */
  innerIndex?: boolean | {
    /**
     * 是否显示表格的索引列  
     * 只要innerIndex传入一个真值，它即为真，除非显式的指定其值为false
     */
    show?: boolean | undefined;
    [x: string]: unknown;
  };
  /** 内部 - 选择列; 默认 false */
  innerSelection?: boolean | {
    /** 
     * 是否显示表格的选择列  
     * 只要innerSelection传入一个真值，它即为真，除非显式的指定其值为false
     */
    show?: boolean | undefined;
    /** 同步表格的已选项，可指定一个响应式对象（数组） */
    data?: unknown[];
    [x: string]: unknown;
  };
  /** 内部 - 操作列; 默认 undefined */
  innerOperation?: boolean | {
    /**
     * 是否显示表格的操作列  
     * - 默认undefined，是否显示操作栏由表格的row-menu插槽决定，除非显式的指定布尔值  
     * - 当不确定按钮是否存在时(权限不同)，推荐不设置(即保持undefined, 由插槽内容决定)
     */
    show?: boolean | undefined;
    /**
     * 操作列每行最多显式的按钮数量  
     * - 超过将自动加入“更多”按钮  
     * - 如果不是有效的大于0的数字，将显示所有按钮
     */
    maxNumOfBtn?: number;
    /**
     * 操作列是否启用自动宽度；默认为 true 将根据按钮文本自动计算宽度  
     * - 当设置固定宽度 width 后，此选项失效；  
     * - 当设置的最小宽度 minWidth 不是一个数字时，此选项失效；
     */
    enableAutoWidth: boolean;
  };
  /** 内部 - 分页器 */
  innerPagination?: boolean | {
    /** 是否显示表格的分页器，与innerPagination的布尔值类型等效 */
    show?: boolean | undefined;
    [x: string]: unknown;
  };
  /**
   * 搜索重置事件；监听此事件，即顶替默认的搜索重置动作(与callback相同)  
   * - callback 重置搜索表单并立即搜索  
   * - reset 仅重置搜索表单  
   * - search 仅立即搜索
   */
  onSearchReset?: (context: {
    /** 重置搜索表单并立即搜索 */
    callback: () => void;
    /** 仅重置搜索表单 */
    reset: () => void;
    /** 仅立即搜索 */
    search: () => void;
  }) => void;
}

interface EaTableData {
  /** 组件内部的搜索表单，未指定响应式对象时，也可直接访问 */
  searchForm: Record<string, unknown>
}

interface EaTableSlots extends Vue {
  $scopedSlots: {
    /** 
     * 操作列的行菜单插槽  
     * 默认情况下，将决定是否显示操作列（如果每一行都没有有效插槽节点的话，就不会显示操作列）
     */
    ['row-menu']?: (context: { row: unknown, column: unknown, value: unknown }) => VNode[];
    /** 顶部菜单插槽 右上 */
    ['top-menu']?: () => VNode[];
    /** 底部菜单插槽 左下 */
    ['bottom-menu']?: () => VNode[];
    /** 在索引列之后 如果你想在此处自定义列 */
    ['after-index-column']?: () => VNode[];
    /** 在选择列之后 如果你想在此处自定义列 */
    ['after-selection-column']?: () => VNode[];
    /** 在操作列之前 如果你想在此处自定义列 */
    ['before-action-column']?: () => VNode[];
    /** 在所有 el-table-column 组件之前 如果你想在此处自定义列 */
    ['before-column']?: () => VNode[];
    /** 在所有 el-table-column 组件之后 如果你想在此处自定义列 */
    ['after-column']?: () => VNode[];
    /** 
     * 搜索栏主体插槽  
     * 如果你不想使用现有的搜索栏，此插槽允许你将其替换为其他组件
     */
    ['search']?: () => VNode[];
    /**
     * 表格主体插槽  
     * 如果你不想用表格来展示数据的话，此插槽允许你将其替换为其他组件  
     * 它会传递给你表格当前页的数据
     */
    ['table']?: (data: unknown[]) => VNode[];
    /** 
     * 底部主体插槽  
     * 如果你不想使用底部内容(包含底部菜单和分页器)，此插槽允许自定义
     */
    ['footer']?: () => VNode[];
  };
}

interface EaTableMethods extends Record<string, () => void> {
  /** 刷新表格 */
  handleRefresh: () => void;
  /** 立即搜索 */
  handleSearch: () => void;
  /** 隐式刷新被render渲染函数控制的单元格 */
  hideRefresh: () => void;
  /** 清空表格 */
  handleClear: () => void;
}

/** 
 * 表格组件  
 * 此组件扩展了 el-table 组件。不同的是：
 * - 它使用对象数组来控制表格列
 * - 封装了搜索栏，动态宽度，动态折叠等
 * - 封装了分页组件，自动分页
 * - 各个位置留有菜单栏插槽，布局合理
 */
export declare const EaTable: DefineComponent<
  EaTableProps,
  object,
  object,
  Record<string, () => unknown> & EaTableData,
  EaTableMethods,
  object,
  object
> & {
  new(): EaTableSlots
}

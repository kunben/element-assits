import type { VueConstructor, VNode, VNodeChildren, VNodeData, CreateElement } from 'vue'

/** 创建一个随机ID, 默认16位 */
export declare function uuid (length?: number): string;

/** 对一个树数据进行递归遍历 */
export declare function recursive<T> (
  /** 树数据 */
  data: T[],
  /** 遍历回调 */
  callback: (
    /** 当前项 */
    item: T,
    /** 当前项的祖先路径（不含自身） */
    path: T[]
  ) => false | void,
  /** 树数据子项所在属性，默认children */
  childrenProp?: string,
  /** 初始祖先路径，默认[] */
  path?: T[]
): false | void;

/** 对一个树数据进行过滤 */
export declare function recursiveFilter<T> (
  /** 树数据 */
  data: T[],
  /** 遍历回调 */
  callback: (
    /** 当前项 */
    item: T,
    /** 当前项的祖先路径（不含自身） */
    path: T[]
  ) => boolean,
  /** 树数据子项所在属性，默认children */
  childrenProp?: string
): T

type ImportFunc = () => Promise<{ default: VueConstructor }>
/**
 * 异步载入一个组件，并插入body
 * 1. 异步插入的组件在不在应用树，取决于此函数的this指向
 * 2. 异步插入的组件在其发出 "closed" 事件时才会被销毁，否则需要自行销毁
 */
export declare function asyncLoad (importFunc: ImportFunc | VueConstructor, data: VNodeData): void
export declare function asyncLoad (importFunc: ImportFunc | VueConstructor, data: VNodeData, nodes: VNodeChildren): void

/** 关于字典项的配置 */
interface Props {
  /** 字典项描述 对应的字段；默认"label" */
  label?: string;
  /** 字典项的值 对应的字段；默认"value" */
  value?: string;
  /** 字典项的样式 对应的字段；默认"style" */
  style?: string;
  /** 对单元格的值先行过滤（再与字典项的值匹配） */
  filter?: (context: {
    /** 当前单元格的原始值 */
    value: unknown;
    /** 当前单元格所在行数据 */
    row: unknown;
    /** 当前单元格所在列信息 */
    column: unknown;
    /** 当前单元格所在表实例(EaTable) */
    that: unknown;
  }) => unknown;
  /** 是否渲染为标签（el-tag）；默认false */
  tag?: boolean
}

/** 当需要自行处理渲染结果时，传入此回调 */
type Callback<T> = (h: CreateElement, context: {
  /** 当前单元格的值 */
  value: unknown;
  /** 当前单元格的值在字典中匹配的描述，可能为空（匹配不到） */
  label?: string;
  /** 当前单元格的值在字典中匹配的字典项，可能为空（匹配不到） */
  item?: T;
  /** 当前单元格所在的行数据 */
  row?: unknown;
  /** 当前单元格所在的列信息 */
  column?: unknown;
  /** 当前单元格所在表实例(EaTable) */
  that?: unknown;
  /** 隐式刷新当前单元格(仅在EaTable中有效) */
  hideRefresh: () => void;
}) => VNode

/** 同步或异步数据 */
type asyncData<T> = T[] | Promise<T[]> | (() => T[] | Promise<T[]>)

/** 生成异步渲染字典单元格的函数（仅在 EaTable 的列信息配置中有效） */
export declare function renderCell<T> (
  data: asyncData<T>,
  props?: Props | boolean,
  callback?: Callback<T>
): () => VNode
export declare function renderCell<T> (
  data: asyncData<T>,
  callback?: Callback<T>
): () => VNode

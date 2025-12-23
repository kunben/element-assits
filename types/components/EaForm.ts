import Vue, { DefineComponent, Component, VNode } from 'vue'
import type { Placement, EffectType } from '../helper'
import type { Rules } from '../async-validator-type'

type Dynamic<T> = T | ((model: Record<string, unknown>, that: unknown) => T)
type TInvalidFields = Record<string, Array<{ message: string, field: string }>>
export type ElFormValidateCallback = (valid: boolean, invalidFields: TInvalidFields) => void

interface Tooltip {
  /** 状态是否可见，默认值 `false` */
  value?: boolean
  /** 默认提供的主题，默认值 `dark` */
  effect?: EffectType
  /** 显示的内容，也可以通过 slot#content 传入 DOM */
  content?: string
  /** Tooltip 的出现位置 */
  placement?: Placement
  /** Tooltip 是否可用，默认值 `false` */
  disabled?: boolean
  /** 出现位置的偏移量，默认值 `0` */
  offset?: number
  /** 定义渐变动画，默认值 `el-fade-in-linear` */
  transition?: string
  /** 是否显示 Tooltip 箭头，更多参数可见Vue-popper，默认值 `true` */
  visibleArrow?: boolean
  /** popper.js 的参数，默认值 `{ boundariesElement: 'body', gpuAcceleration: false }` */
  popperOptions?: Record<string, unknown>
  /** 延迟出现，单位毫秒，默认值 `0` */
  openDelay?: number
  /** 手动控制模式，设置为 true 后，mouseenter 和 mouseleave 事件将不会生效，默认值 `false` */
  manual?: boolean
  /** 为 Tooltip 的 popper 添加类名 */
  popperClass?: string
  /** 鼠标是否可进入到 tooltip 中，默认值 `true` */
  enterable?: boolean
  /** Tooltip 出现后自动隐藏延时，单位毫秒，为 0 则不会自动隐藏，默认值 `0` */
  hideAfter?: number
  /** Tooltip 组件的 tabindex，默认值 `0` */
  tabindex?: number
}

export interface EaFormColumn {
  prop: string;
  label?: Dynamic<string>;
  labelTooltip?: Dynamic<string | Tooltip>;
  show?: Dynamic<boolean>;
  enable?: Dynamic<boolean>;
  labelWidth?: string;
  component?: Dynamic<Component>;
  required?: boolean;
  rules: Dynamic<Rules>;
  on: Dynamic<Record<string, unknown>>;
  bind: Dynamic<Record<string, unknown>>;
}

export interface EaFormProps {
  model: Record<string, unknown>;
  column: EaFormColumn[];
  rules?: Rules;
  labelWidth?: string;
  inline?: boolean;
  dense?: boolean;
}

export interface EaFormMethods extends Record<string, (...args: unknown[]) => void> {
  /** 对整个表格设置值, 会忽略 null 和 undefined */
  setData: (data: Record<string, unknown>) => void;
  /** 对整个表单进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：是否校验成功和未通过校验的字段。若不传入回调函数，则会返回一个 promise */
  validate: (callback: ElFormValidateCallback) => Promise<boolean>;
  /** 对部分表单字段进行校验的方法 */
  validateField: (prop: string | string[], callback: (errorMessage: string) => void) => void;
  /** 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果 */
  resetFields: () => void;
  /** 移除表单项的校验结果。传入待移除的表单项的 prop 属性或者 prop 组成的数组，如不传则移除整个表单的校验结果 */
  clearValidate: (props?: string | string[]) => void;
}

interface EaFormSlots extends Vue {
  /** 在表单内容之后 */
  ['default']?: () => VNode[];
  /** 在表单内容之前 */
  ['content-before']?: () => VNode[];
}

/** 
 * 表单组件  
 */
export declare const EaForm: DefineComponent<
  EaFormProps,
  object,
  object,
  Record<string, () => unknown>,
  EaFormMethods,
  object,
  object
> & {
  new(): EaFormSlots
}

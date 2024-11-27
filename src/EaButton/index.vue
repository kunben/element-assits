<template>
<el-tooltip
  v-if="Boolean(tooltip)"
  :content="tooltip"
  :open-delay="disabled ? 0 : 700"
  placement="top"
  effect="light"
  :class="{'ea-button-tooltip': 1, 'text': binds.value?.type === 'text'}">
  <span>
    <el-button
      v-bind="binds.value"
      :disabled="disabled"
      :class="{
        'ea-button': 1,
        'mini-rect-btn': customType,
        [customType || '']: 1
      }"
      v-on="$listeners">
      <slot name="default">{{ binds.text }}</slot>
    </el-button>
  </span>
</el-tooltip>
<el-button
  v-else
  v-bind="binds.value"
  :disabled="disabled"
  :class="{
    'ea-button': 1,
    'mini-rect-btn': customType,
    [customType || '']: 1
  }"
  v-on="$listeners">
  <slot name="default">{{ binds.text }}</slot>
</el-button>
</template>

<script>
export default {
  props: {
    customType: { type: String, default: undefined },
    tooltip: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    feat: { type: String, default: undefined },
    type: { type: String, default: undefined },
    icon: { type: String, default: undefined }
  },
  computed: {
    binds () {
      const parseFeat = () => {
        const arr = typeof this.feat === 'string' ? this.feat.split('|') : []
        return {
          type: this.type || arr[0],
          icon: this.icon || arr[1],
          text: arr[2]
        }
      }
      const { type, icon, text } = parseFeat()
      const value = Object.assign(
        this.customType ? {
          plain: true,
          size: 'mini',
          type: 'primary'
        } : {
          type,
          icon
        },
        this.$attrs
      )
      return { value, text }
    }
  }
}
</script>

<style lang="scss">
.ea-button-tooltip + .ea-button-tooltip {
  margin-left: 10px;
}
td {
  .ea-button-tooltip + .ea-button-tooltip {
    margin-left: 4px;
    &.text {
      margin-left: 10px;
    }
  }
  .el-button [class*="el-icon-"] + span {
    margin-left: 2px;
  }
}

.el-button.ea-button.mini-rect-btn {
  padding: 7px;
  border: 0;
  & [class^="design-"] {
    margin-right: 0;
  }
  &:not(.is-disabled) {
    &.primary {
      background-color: rgba($--color-primary, .15);
      color: $--color-primary;
      &:hover,&:focus {
        background-color: $--color-primary;
        i { color: #fff }
      }
    }
    &.success {
      background-color: rgba($--color-success, .15);
      color: $--color-success;
      &:hover,&:focus {
        background-color: $--color-success;
        i { color: #fff }
      }
    }
    &.info {
      background-color: rgba($--color-info, .15);
      color: $--color-info;
      &:hover,&:focus {
        background-color: $--color-info;
        i { color: #fff }
      }
    }
    &.warning {
      background-color: rgba($--color-warning, .15);
      color: $--color-warning;
      &:hover,&:focus {
        background-color: $--color-warning;
        i { color: #fff }
      }
    }
    &.danger {
      background-color: rgba($--color-danger, .15);
      color: $--color-danger;
      &:hover,&:focus {
        background-color: $--color-danger;
        i { color: #fff }
      }
    }
  }
}
</style>

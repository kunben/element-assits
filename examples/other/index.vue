<template>
<div>
  <div>
    v-bind :
    单独绑定属性 和 绑定一个对象
    是层级关系，单独绑定的权重大于对象绑定

    <br>
    到了vue3，这种关系发生变化。不再有权重，而是看绑定的顺序
  </div>
  <SubComponent
    text="abc"
    v-bind="{text: 'def'}" />
  <SubComponent
    v-bind="{text: 'def'}"
    text="abc" />
  <SubComponent
    v-bind="{text: 'def'}" />
  <el-divider />

  <div>
    v-on @
    单独绑定事件 和 绑定事件集合
    是共生关系，无论单独绑定两者都生效
  </div>
  <SubComponent text="测试log 都绑定" @input="test1" v-on="{ input: test2 }" />
  <SubComponent text="测试log 只@" @input="test1" />
  <SubComponent text="测试log 只v-on" v-on="{ input: test2 }" />
</div>
</template>

<script setup>
import SubComponent from './SubComponent.vue'

function test1 () {
  console.log(1)
}
function test2 () {
  console.log(2)
}
</script>

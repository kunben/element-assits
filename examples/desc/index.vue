<template>
<EaDesc
  :data="data"
  :column="column"
  :gutter="18"
  :split="4" />
</template>

<script>
const data = {
  a: 1,
  b: 2,
  c: 3,
  d: 4
}
const column = [
  { label: 'A', prop: 'a' },
  { label: 'B', prop: 'b' },
  { label: 'C', prop: 'c' },
  { label: 'D', prop: 'd' }
]
export default {
  data () {
    return {
      data,
      column
    }
  }
}
</script>

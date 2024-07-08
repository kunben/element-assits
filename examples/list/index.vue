<template>
<EaList :page-request="pageRequest" />
</template>

<script>
const list = Array(333).fill(0).map((m, i) => {
  return {
    label: `第${i}项`,
    value: i
  }
})
export default {
  data () {
    return {
      list
    }
  },
  methods: {
    pageRequest (pager) {
      const start = (pager.current - 1) * pager.pageSize
      const end = start + pager.pageSize
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: list.slice(start, end),
            total: list.length
          })
        }, 700)
      })
    }
  }
}
</script>

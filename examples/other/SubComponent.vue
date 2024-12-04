<template>
<div @click="$emit('input')">
  {{ text }}
</div>
</template>

<script setup>
defineProps({
  text: { type: String, default: undefined }
})
</script>

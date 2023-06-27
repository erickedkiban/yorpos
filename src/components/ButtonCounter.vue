<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button @click="count++">You clicked me ITO na sya sir {{ count }} times.</button>
</template>

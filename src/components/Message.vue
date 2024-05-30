<template>
  <div v-if="show" :class="msgClass"><slot /></div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps(['show', 'type'])

const msgClass = computed(() => {
  let c = 'p-3 text-size-sm rounded fixed top-.25rem left-0 right-0'
  switch (props.type){
    case 'error':
      c = `${c} bg-red-300 text-red-900`
    break;
    case 'success':
      c = `${c} bg-emerald-700 text-white`
    break;
  }

  return c
})
</script>
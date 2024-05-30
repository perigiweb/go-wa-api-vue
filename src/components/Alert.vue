<template>
  <div class="fixed top-5 right-8 max-w-400px leading-none">
    <div :class="alertClass">
      <div class="flex-1"><slot /></div>
      <button type="button" @click.prevent="alert = null"
        class="px-2 py-1 bg-transparent border-0"
      ><font-awesome-icon icon="fad fa-times"></font-awesome-icon></button>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes } from '@fortawesome/pro-duotone-svg-icons'

library.add(faTimes)

const props = defineProps(['type'])

const alertClass = computed(() => {
  let c = ''
  if (props.type){
    c = `${c} p-3 text-sm rounded w-auto mx-auto flex gap-3 justify-between items-center`
    switch(props.type){
      case 'error':
        c = `${c} bg-red-300 text-red-900`
      break
      case 'success':
        c = `${c} bg-emerald-300 text-emerald-900`
      break
      case 'warning':
        c = `${c} bg-amber-300 text-amber-900`
      break;
    }
  }

  return c
})
</script>
<template>
  <div class="flex flex-row gap-2 justify-center items-center mx-2 text-slate-300" v-if="state">
    <font-awesome-icon :icon="['fad', 'fa-spinner-third']" spin class="align-middle"></font-awesome-icon>
    <span class="inline-block text-sm align-middle" v-if="text">{{ text }}</span>
  </div>
</template>
<script setup>
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSpinnerThird } from '@fortawesome/pro-duotone-svg-icons'

library.add(faSpinnerThird)

defineProps(['text', 'state'])
</script>
<template>
  <div class="h-48px bg-slate-800 flex items-center justify-between bg-slate-900 px-3 border-0 border-b border-solid border-slate-800">
    <div class="leading-none">
      <h1 class="text-base font-semibold leading-none">{{ title }}</h1>
      <span v-if="subTitle" class="block text-xs text-slate-200">{{ subTitle }}</span>
    </div>
    <div class="flex items-center justify-end gap-3">
      <router-link :to="{name: 'wa-state', params: {deviceId: $route.params.deviceId}}" class="text-center no-underline">
        <font-awesome-icon icon="fad fa-address-book" class="block mx-auto"></font-awesome-icon>
        <span class="block text-xs">Contacts</span>
      </router-link>
      <router-link :to="{name: 'wa-broadcasts', params: {deviceId: $route.params.deviceId}}" class="text-center no-underline">
        <font-awesome-icon icon="fad fa-bullhorn" class="block mx-auto"></font-awesome-icon>
        <span class="block text-xs text-center">Broadcast</span>
      </router-link>
    </div>
  </div>
</template>
<script setup>
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faAddressBook, faBullhorn } from '@fortawesome/pro-duotone-svg-icons'

library.add(faAddressBook, faBullhorn)

defineProps({
  title: String,
  subTitle: String|undefined
})
</script>
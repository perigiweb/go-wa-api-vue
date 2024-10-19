<template>
  <div class="relative">
    <span class="flex items-center absolute left-1.25rem top-0 bottom-0 text-white"><font-awesome-icon icon="fad fa-search"></font-awesome-icon></span>
    <span v-if="searchQuery" @click.prevent="clearSearchQuery" class="flex items-center absolute right-1.25rem top-0 bottom-0 text-white cursor-pointer"><font-awesome-icon icon="fad fa-times"></font-awesome-icon></span>
    <input type="text" v-model="searchQuery"
      class="border border-0 bg-slate-600 text-white py-2 pl-2.75rem pr-3 outline-none w-full text-sm"
      placeholder="Search by Name or Phone">
  </div>
  <div v-if="error" class="bg-red-300 text-red-900 p-2 text-sm h-auto">{{ error }}</div>
  <div class="flex-1 overflow-y-auto">
    <loading :state="loadingState" class="p-3"></loading>
    <div v-if="waContacts.length == 0 && !loadingState && !error" class="p-3 text-center text-sm">No contact found.</div>
    <div v-if="waContacts.length" class="flex flex-col gap-1">
      <div v-for="c in waContacts" class="relative">
        <button class="flex-1 btn-no-border block leading-none bg-transparent text-light text-left w-full hover:bg-slate-700"
          @click.prevent="sendMessage(c)">
          <b class="block">{{ c.name }}</b>
          <small>{{ fmtPhoneFromJID(c.phone) }}</small>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useDeviceStore } from '../stores/device'
import { fmtPhoneFromJID } from '../utils'

import Loading from './Loading.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSearch, faTimes } from '@fortawesome/pro-duotone-svg-icons'

library.add(faSearch, faTimes)

const router           = useRouter()
const deviceStore      = useDeviceStore()
const waContacts       = ref(deviceStore.waContacts)
const loadingState     = ref(true)
const error            = ref(null)
const searchQuery      = ref('')

const clearSearchQuery = () => {
  searchQuery.value = ''
}

const sendMessage      = (c) => {
  //console.log(c)
  router.push({
    name: 'wa-send',
    params: {
      deviceId: deviceStore.device.id
    },
    query: {
      phone: c.phone
    }
  })
}

watchEffect(() => {
  if (waContacts.value.length){
    loadingState.value = false
  }
})

watchEffect(() => {
  if (searchQuery.value != ""){
    const regex = new RegExp(searchQuery.value, 'i')
    waContacts.value = deviceStore.waContacts.filter(c => (c.name.match(regex) !== null || c.phone.match(regex) !== null))
  } else {
    waContacts.value = deviceStore.waContacts
  }
})

onMounted(() => {
  deviceStore.getDeviceContacts()
})
</script>
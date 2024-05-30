<template>
  <div class="flex flex-col flex-1">
    <div class="py-3 px-5 border-b border-solid border-slate-500">
      <router-link :to="{name: 'wa-broadcast', params: {deviceId: device.id}}"
        class="text-sm text-green-300 visited:text-green-300 active:text-green-300 no-underline hover:text-green-200"
      ><font-awesome-icon icon="fad fa-plus"></font-awesome-icon> Send Broadcast</router-link>
    </div>
    <div v-if="error" class="bg-red-300 text-red-900 p-2 text-sm h-auto">{{ error }}</div>
    <div class="flex-1 overflow-y-auto">
      <loading :state="loadingState" class="p-3"></loading>
      <div v-if="broadcasts.length == 0 && !loadingState && !error" class="p-3 text-center text-size-sm">No broadcast found.</div>
      <div v-if="broadcasts.length" class="flex flex-col">
        <div v-for="b in broadcasts" class="flex justify-between items-center gap-1 border-b border-solid border-slate-500 hover:bg-slate-700 w-full">
          <button class="flex-1 btn-no-border py-3 block leading-none bg-transparent text-light text-left truncate"
            @click.prevent="$emit('show', b)">
            <b class="block">{{ b.campaignName }}</b>
            <small>{{ fmtDate(b.createdAt) }}</small>
          </button>
          <div class="flex gap-2 items-center px-2">
            <button class="bg-transparent border-0 cursor-pointer text-slate-400 hover:text-slate-200" @click.prevent="editBroadcast(b)"><font-awesome-icon icon="fad fa-edit"></font-awesome-icon></button>
            <button class="bg-transparent border-0 cursor-pointer text-red-400 hover:text-red-200" @click.prevent="$emit('delete', b.id)"><font-awesome-icon icon="fad fa-trash"></font-awesome-icon></button>
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-center bg-slate-900">
      <button :disabled="!prevPage" @click.prevent="currentPage--" class="btn bg-transparent border-0 text-white hover:bg-slate-800 rounded-none disabled:text-slate-400 disabled:hover:bg-slate-900 disabled:cursor-default"><font-awesome-icon icon="fad fa-chevron-left"></font-awesome-icon></button>
      <div class="flex-1 text-center py-2 text-xs" v-html="dataOfTotal"></div>
      <button :disabled="!nextPage" @click.prevent="currentPage++" class="btn bg-transparent border-0 text-white hover:bg-slate-800 rounded-none disabled:text-slate-400 disabled:hover:bg-slate-900 disabled:cursor-default"><font-awesome-icon icon="fad fa-chevron-right"></font-awesome-icon></button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '../plugins/useapi'
import { useDeviceStore } from '../stores/device'
import Loading from './Loading.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEdit, faTrash, faChevronLeft, faChevronRight, faPlus } from '@fortawesome/pro-duotone-svg-icons'

library.add(faEdit, faTrash, faChevronLeft, faChevronRight, faPlus)

const { device }     = useDeviceStore()
const loadingState   = ref(true)
const error          = ref(null)
const broadcasts     = ref([])
const prevPage       = ref(null)
const nextPage       = ref(null)
const currentPage    = ref(1)
const totalBroadcast = ref(0)
const limit          = ref(0)

const api = useApi()

const editBroadcast = (broadcast) => {
  console.log("Edit broadcast", broadcast)
}

const dataOfTotal = computed(() => {
  const min = ((currentPage.value - 1) * limit.value) + 1
  let max = currentPage.value * limit.value
  if (max > totalBroadcast.value){
    max = totalBroadcast.value
  }

  return totalBroadcast.value > 0 ? `${min} &ndash; ${max} of ${totalBroadcast.value}`:'&nbsp;'
})

const fmtDate = (dateStr) => {
  const d = new Date(Date.parse(dateStr))

  return d.toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    year: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: 'numeric'
  })
}

onMounted(async () => {
  loadingState.value = true
  const response = await api.get(`me/wa/${device.id}/broadcasts`, {useAuthToken: true})
  console.log(response)
  if (response.status){
    broadcasts.value = response.data.broadcasts
    limit.value = response.data.limit
    totalBroadcast.value = response.data.total
    prevPage.value = response.data.prevPage
    nextPage.value = response.data.nextPage
  }

  loadingState.value = false
})
</script>
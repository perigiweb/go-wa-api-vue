<template>
  <alert v-if="alert" :type="alert.type" @close="alert = null" autoclose="5">{{ alert.message }}</alert>
  <div class="w-360px shrink-0 h-full bg-slate-800 flex flex-col">
    <device-sidebar-header title="Broadcast"></device-sidebar-header>
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
          <div v-for="b in broadcasts" class="flex justify-between items-center gap-1 border-b border-solid border-slate-500 hover:bg-slate-700 w-full has-[:disabled]:bg-slate-700">
            <button :disabled="delBcId === b.id" class="flex-1 btn-no-border py-3 block leading-none bg-transparent text-light text-left truncate disabled:opacity-50 disabled:cursor-not-allowed"
              @click.prevent="show(b)">
              <b class="block">{{ b.campaignName }}</b>
              <small>{{ fmtDate(b.createdAt) }}</small>
            </button>
            <div class="flex gap-2 items-center px-2">
              <font-awesome-icon :icon="`fad ${b.completed ? 'fa-check-circle':'fa-clock'}`" :class="b.completed ? 'text-green':'text-slate-400'"></font-awesome-icon>
              <button :disabled="delBcId === b.id" class="bg-transparent border-0 cursor-pointer text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-400" @click.prevent="edit(b)"><font-awesome-icon icon="fad fa-edit"></font-awesome-icon></button>
              <button :disabled="delBcId === b.id" class="bg-transparent border-0 cursor-pointer text-red-400 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-slate-400" @click.prevent="del(b.id)"><font-awesome-icon icon="fad fa-trash"></font-awesome-icon></button>
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
  </div>
  <div class="flex-1 h-full overflow-auto p-4">
    <pre>{{ broadcast }}</pre>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useApi } from '../../plugins/useapi'
import { useDeviceStore } from '../../stores/device'
import { fmtDate } from '../../utils'

import DeviceSidebarHeader from '../../components/DeviceSidebarHeader.vue'
import Alert from '../../components/Alert.vue'
import Loading from '../../components/Loading.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEdit, faTrash, faChevronLeft, faChevronRight, faPlus, faCheckCircle, faClock } from '@fortawesome/pro-duotone-svg-icons'

library.add(faEdit, faTrash, faChevronLeft, faChevronRight, faPlus, faCheckCircle, faClock)

const { device }     = useDeviceStore()
const api            = useApi()

const broadcast      = ref()
const alert          = ref(null)
const loadingState   = ref(true)
const error          = ref(null)
const broadcasts     = ref([])
const prevPage       = ref(null)
const nextPage       = ref(null)
const currentPage    = ref(1)
const totalBroadcast = ref(0)
const limit          = ref(0)
const delBcId        = ref()

const dataOfTotal = computed(() => {
  const min = ((currentPage.value - 1) * limit.value) + 1
  let max = currentPage.value * limit.value
  if (max > totalBroadcast.value){
    max = totalBroadcast.value
  }

  return totalBroadcast.value > 0 ? `${min} &ndash; ${max} of ${totalBroadcast.value}`:'&nbsp;'
})

const show = (b) => {
  broadcast.value = b
}

const edit = (broadcast) => {
  console.log("Edit broadcast", broadcast)
}

const del = async (broadcastId) => {
  alert.value = null
  delBcId.value = broadcastId
  console.log(`Delete broadcast with id ${broadcastId}`)
  const response = await api.delete(`me/wa/${device.id}/broadcast/${broadcastId}`, {useAuthToken: true})
  console.log(response)
  alert.value = {
    type: response.status ? 'success':'error',
    message: response.message || (response.status ? 'Broadcast deleted successfully':'Unknown error occurred while deleting broadcast')
  }

  if (response.status){
    broadcasts.value = broadcasts.value.filter(item => item.id !== broadcastId)
    if (broadcast.value && broadcast.value.id === broadcastId){
      broadcast.value = undefined
    }
  } else {
    delBcId.value = undefined
  }
}

onMounted(async () => {
  loadingState.value = true
  const response = await api.get(`me/wa/${device.id}/broadcasts`, {useAuthToken: true})
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
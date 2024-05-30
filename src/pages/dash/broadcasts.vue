<template>
  <alert v-if="alert" :type="alert.type">{{ alert.message }}</alert>
  <div class="w-360px shrink-0 h-full bg-slate-800 flex flex-col">
    <device-sidebar-header title="Broadcast"></device-sidebar-header>
    <list-broadcast @show="showBroadcast" @delete="delBroadcast"></list-broadcast>
  </div>
  <div class="flex-1 h-full overflow-auto p-4">
    <pre>{{ broadcast }}</pre>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useApi } from '../../plugins/useapi'
import { useDeviceStore } from '../../stores/device'

import DeviceSidebarHeader from '../../components/DeviceSidebarHeader.vue'
import ListBroadcast from '../../components/ListBroadcast.vue'
import Alert from '../../components/Alert.vue'

const { device } = useDeviceStore()

const broadcast = ref()
const alert     = ref(null)

const showBroadcast = (b) => {
  broadcast.value = b
}

const api = useApi()
const delBroadcast = async (broadcastId) => {
  console.log(`Delete broadcast with id ${broadcastId}`)
  const response = await api.delete(`me/wa/${device.id}/broadcast/${broadcastId}s`, {useAuthToken: true})
  console.log(response)
}
</script>
<template>
  <div class="w-360px shrink-0 h-full bg-slate-800 flex flex-col">
    <device-sidebar-header title="Contacts" sub-title="Contacts in WhatsApp Account"></device-sidebar-header>
    <whats-app-contact></whats-app-contact>
  </div>
  <div class="flex-1 h-full overflow-auto p-4">
    <div class="p-5">
      <p><router-link :to="{name: 'wa-send', params: {deviceId: device.id}}" class="btn btn-green">Send Message</router-link></p>
      <p><router-link :to="{name: 'wa-broadcast', params: {deviceId: device.id}}" class="btn btn-green">Send Broadcast Message</router-link></p>
      <p><button type="button" class="btn btn-green" @click.prevent="getAvatar">Get Avatar</button></p>
    </div>
  </div>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useDeviceStore } from '../../stores/device'
import { useApi } from '../../plugins/useapi'

import DeviceSidebarHeader from '../../components/DeviceSidebarHeader.vue'
import WhatsAppContact from '../../components/WhatsAppContact.vue'

const { device } = storeToRefs(useDeviceStore())
const { get }    = useApi()

const getAvatar = async () => {
  const r = await get(`me/wa/${device.value.id}/avatar?jid=6281222662272@s.whatsapp.net`, {useAuthToken: true})
  console.log(r)
}

//getAvatar()
</script>
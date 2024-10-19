<template>
  <div class="w-360px shrink-0 h-full bg-slate-800 flex flex-col">
    <device-sidebar-header :title="sidebarTitle" :sub-title="sidebarSubTitle"></device-sidebar-header>
    <component :is="sidebarComp"></component>
  </div>
  <div class="flex-1 h-full overflow-auto p-4">
    <div class="p-5">
      <p><router-link :to="{name: 'wa-send', params: {deviceId: device.id}}" class="btn btn-green">Send Message</router-link></p>
      <p><router-link :to="{name: 'wa-broadcast', params: {deviceId: device.id}}" class="btn btn-green">Send Broadcast Message</router-link></p>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useDeviceStore } from '../../stores/device'
import { useApi } from '../../plugins/useapi'

import DeviceSidebarHeader from '../../components/DeviceSidebarHeader.vue'
import WhatsAppContact from '../../components/WhatsAppContact.vue'
import WhatsAppChats from '../../components/WhatsAppChats.vue'
import WhatsAppBroadcast from '../../components/WhatsAppBroadcast.vue'

const { device }      = storeToRefs(useDeviceStore())
const { get }         = useApi()
const route           = useRoute()
const sidebarComp     = ref(null)
const sidebarTitle    = ref('Chats')
const sidebarSubTitle = ref(null)

const components = {
  contacts: {
    c: WhatsAppContact,
    t: 'Contacts',
    st: 'Contacts in WhatsApp'
  },
  broadcasts: {
    c: WhatsAppBroadcast,
    t: 'Broadcasts',
  }
}
if (route.params.c && components[route.params.c]){
  sidebarComp.value     = components[route.params.c].c
  sidebarTitle.value    = components[route.params.c].t || route.params.c
  sidebarSubTitle.value = components[route.params.c].st || ''
} else {
  sidebarComp.value = WhatsAppChats
}
</script>

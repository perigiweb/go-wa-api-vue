<template>
  <aside class="flex flex-col w-200px shrink-0 h-full bg-slate-900 border-0 border-r border-solid border-slate-800">
    <div class="h-48px flex items-center justify-center font-bold font-lg border-0 border-b border-solid border-slate-800">AnotherWA</div>
    <div class="flex-1 overflow-y-auto">
      <loading :state="devices.length == 0 && !error"></loading>
      <div v-if="error" class="bg-red-300 text-red-900 p-2 text-size-sm">{{ error }}</div>
      <div v-if="devices.length" class="flex flex-col">
        <div v-for="device in devices" class="relative border-0 border-b border-solid border-color-slate-800">
          <button class="absolute right-5px top-3 bg-transparent border-0 cursor-pointer" @click.prevent="removeDevice(device.id)"><font-awesome-icon icon="fad fa-trash" class="text-red-400"></font-awesome-icon></button>
          <router-link class="btn-no-border block hover:bg-slate-800 leading-none py-3"
            :to="{name: 'wa-state', params: {deviceId: device.id}}">
            <b class="block">{{ device.name }}</b>
            <small v-if="device.jid">{{ fmtPhoneFromJID(device.jid) }}</small>
          </router-link>
          <router-link class="btn-no-border block hover:bg-slate-800 leading-none pr-3 pl-6"
            :to="{name: 'wa-send', params: {deviceId: device.id}}">&raquo; Send Message</router-link>
          <router-link class="btn-no-border block hover:bg-slate-800 leading-none pr-3 pl-6"
            :to="{name: 'wa-broadcast', params: {deviceId: device.id}}">&raquo; Send Broadcast</router-link>
        </div>
        <router-link :to="{name: 'wa-new'}" class="btn-no-border hover:bg-slate-800">New WhatsApp</router-link>
      </div>
    </div>
    <div class="flex flex-col">
      <router-link :to="{name: 'contacts'}" class="btn-no-border bg-transparent hover:bg-slate-800">
        <font-awesome-icon icon="fad fa-address-book"></font-awesome-icon>
        Contacts
      </router-link>
      <router-link :to="{name: 'my-account'}" class="btn-no-border bg-transparent hover:bg-slate-800">
        <font-awesome-icon icon="fad fa-user"></font-awesome-icon>
        My Account
      </router-link>
      <button type="button" class="btn-no-border text-left border-0 bg-transparent text-light hover:bg-slate-800" @click.prevent="actionSignOut">
        <font-awesome-icon icon="fad fa-sign-out" class="text-red-500"></font-awesome-icon> Sign Out
      </button>
    </div>
  </aside>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useDeviceStore } from '../stores/device'
import { fmtPhoneFromJID } from '../utils'

import Loading from './Loading.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSignOut, faAddressBook, faTrash, faUser } from '@fortawesome/pro-duotone-svg-icons'

library.add(faSignOut, faAddressBook, faTrash, faUser)

const { devices } = storeToRefs(useDeviceStore())
const { getDevices, removeDevice } = useDeviceStore()
const { signOut } = useAuthStore()

const router = useRouter()

const actionSignOut = async () => {
  await signOut()
  router.push('/')
}

const error = ref(null)
getDevices().catch(err => {
  error.value = err
})
</script>
<style scoped lang="scss">
aside {
  .router-link-active {
    --at-apply: bg-slate-800;
  }
}
</style>
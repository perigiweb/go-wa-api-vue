<template>
  <div v-if="isWALoggedIn" class="flex flex-row h-full w-full">
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="route.path" />
    </router-view>
  </div>
  <div v-else class="flex flex-col items-center h-full justify-center p-4">
    <loading :state="loadingState" :text="loadingText"></loading>
    <div class="bg-red-300 text-red-900 p-4 rounded" v-if="error">{{ error }}</div>
    <div v-if="error" class="p-2"><button type="button" class="btn btn-green" @click.prevent="getStatus">Reload</button></div>
    <div v-if="qrImage && isValidQrImage" class="px-4">
      <p class="mb-3 text-center">Please scan this QR Code from your phone.</p>
      <p class="text-center">
        <img v-bind:src="qrImage" class="border rounded m-auto">
      </p>
      <p class="text-center">{{ qrImageTimeout }}</p>
    </div>
    <div v-else><p>{{ qrImage }}</p></div>
  </div>
</template>
<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDeviceStore } from '../../stores/device'

import Loading from '../../components/Loading.vue'

const { devices, device, qrImage, qrImageTimeout, isWALoggedIn } = storeToRefs(useDeviceStore())
const { getDeviceStatus } = useDeviceStore()

const route = useRoute()

const defLoadingText = 'Checking device status...'
const loadingState = ref(true)
const loadingText = ref(defLoadingText)
const error = ref(null)

const isValidQrImage = computed(() => {
  return qrImage.value && /^data\:image/.test(qrImage.value)
})

const getStatus = () => {
  error.value = null
  loadingState.value = true
  getDeviceStatus(route.params.deviceId).catch(e => {
    error.value = e
  }).finally(() => {
    if (qrImage.value != "Reconnected"){
      loadingState.value = false
      loadingText.value = defLoadingText
    }
  })
}

watchEffect(() => {
  if (devices.value.length && route.params.deviceId){
    console.log("GETDeviceStatus", route.params.deviceId, device.value?.id)
    getStatus.call()
  }
})

watchEffect(() => {
  console.log(qrImageTimeout.value, qrImage.value)
  if (qrImageTimeout.value > 0 && qrImage.value == 'Reconnected'){
    loadingState.value = true
    loadingText.value = "Reconnecting to WhatsApp..."
    setTimeout(() => {
      getStatus.call()
    }, qrImageTimeout.value * 1000)
  }
})
/*
watch (
  [devices, () => route.params.deviceId],
  () => {
    console.log(devices.value.length, route.params.deviceId)
    if (devices.value.length && (!device || device.id != route.params.deviceId)){
      loadingState.value = true
      getDeviceStatus(route.params.deviceId).catch(e => {
        error.value = e
      }).finally(() => {
        loadingState.value = false
      })
    }
  },
  {immediate: true}
)
*/
/*
watch(qrImageTimeout, (newTimeout, oldTimeout) => {
  console.log({newTimeout, oldTimeout})
  if (newTimeout){
    setTimeout(() => {
      loadingState.value = true
      getDeviceStatus(route.params.deviceId).catch(e => {
        error.value = e
      }).finally(() => {
        loadingState.value = false
      })
    }, newTimeout * 1000)
  }
})
*/
</script>
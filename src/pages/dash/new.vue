<template>
  <div class="h-full">
    <div class="my-16 w-380px max-w-full rounded bg-slate-800 mx-auto">
      <div class="border-0 border-b border-solid border-slate-700 font-bold text-size-lg p-3">
        Add New WhatsApp Account
      </div>
      <div v-if="errMsg" class="bg-red-200 text-red-900 rounded p-2 m-3 w-auto">{{ errMsg }}</div>
      <form method="post" @submit.prevent="save" class="p-4">
        <div class="mb-3"><input type="text" placeholder="WhatsApp Account Name" v-model="deviceName"
          class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-size-sm invalid:border-red-400 valid:border-green-400"
          required></div>
        <button type="submit" class="btn btn-green font-bold" :disabled="isSaving">{{ btnText }}</button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDeviceStore } from '../../stores/device'

const { addDevice } = useDeviceStore()

const router = useRouter()
const errMsg = ref(null)
const deviceName = ref('')
const isSaving = ref(false)
const btnText = computed(() => {
  return isSaving.value ? 'Saving...':'Save'
})
const save = () => {
  isSaving.value = true

  addDevice(deviceName.value).then(device => {
    console.log(device)
    deviceName.value = ''
    router.push({
      name: 'wa-state',
      params: {
        deviceId: device.id
      }
    })
  }).catch(err => {
    errMsg.value = err.message
    isSaving.value = false
  })
}
</script>
import { ref, computed } from 'vue'
import { defineStore } from "pinia"
import { useApi } from '../plugins/useapi'
import { parsePhoneFromJID } from '../utils'

export const useDeviceStore = defineStore('device', () => {
  const api = useApi()

  /*
   * state
   */
  const devices = ref([])
  const device = ref(null)
  const qrImage = ref(null)
  const qrImageTimeout = ref(null)
  const waContacts = ref([])

  /*
   * getters
   */
  const devicesWithJid = computed(() => devices.value.filter(item => item.jid) || [])
  const isWALoggedIn = computed(() => device.value?.isLoggedIn)

  /*
   * actions
   */
  async function getDevices(){
    const r = await api.get('me/devices', {useAuthToken: true})
    devices.value = []
    if (r.status){
      devices.value = r.data
      return true
    }

    throw new Error(r.message)
  }
  async function addDevice(deviceName){
    const response = await api.post(`me/device`, {
      useAuthToken: true,
      json: {name: deviceName}
    })

    if (response.status){
      devices.value.push(response.data)
      return response.data
    }

    throw new Error(response.message)
  }
  async function removeDevice(deviceId){
    if (typeof deviceId === "object"){
      deviceId = deviceId.id
    }

    devices.value = devices.value.filter(d => d.id !== deviceId)

    await api.delete(`me/device/${deviceId}`, {useAuthToken: true})

    return true
  }

  async function getDeviceStatus(deviceId){
    if (device.value && device.value.id == deviceId && device.value.isLoggedIn){
      return true
    }

    qrImage.value = null
    qrImageTimeout.value = null
    device.value = devices.value.filter(item => item.id == deviceId)[0] || null
    if ( !device.value){
      throw new Error(`No device with ID: ${deviceId}`)
    }

    device.value.isLoggedIn = false

    const response = await api.get(`me/wa/${deviceId}/status`, {
      useAuthToken: true,
      timeout: 30000
    })

    if (!response.status){
      throw new Error(response.message)
    }

    qrImage.value = response.data.qrImage
    qrImageTimeout.value = response.data.qrTimeout

    if (qrImage.value == "LoggedIn"){
      device.value.isLoggedIn = true
      //getDeviceContacts.call()
    }
  }

  const fetchDC = ref(false)
  async function getDeviceContacts() {
    if ( !device.value || waContacts.value.length > 0 || fetchDC.value){
      return true
    }

    fetchDC.value = true

    const response = await api.get(`me/wa/${device.value.id}/contacts`, {
      useAuthToken: true
    })

    fetchDC.value = false

    if (!response.status){
      throw new Error(response.message)
    }

    for (const jid in response.data){
      const d = response.data[jid]
      if (d.Found){
        waContacts.value.push({
          jid: jid,
          phone: parsePhoneFromJID(jid),
          name: d.FullName || d.PushName || d.FirstName || d.BusinessName,
          inWA: 1
        })
      }
    }

    //waContacts.value = response.data
  }

  return {
    devices,
    device,
    qrImage,
    qrImageTimeout,
    waContacts,
    devicesWithJid,
    isWALoggedIn,
    getDevices,
    addDevice,
    removeDevice,
    getDeviceStatus,
    getDeviceContacts
  }
})
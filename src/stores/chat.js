import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from "pinia"
import { useApi } from '../plugins/useapi'

import { useDeviceStore } from './device'

export const useChatStore = defineStore('chats', () => {
  const api = useApi()
  const { device } = storeToRefs(useDeviceStore())
  const chats = ref([])
  const chat = ref(null)
  const chatLoading = ref(true)
  const chatErrMsg = ref(null)

  async function getChats(){
    chatErrMsg.value  = null
    chatLoading.value = chats.value.length == 0

    const response = await api.get(`me/wa/${device.value.id}/chats`, {useAuthToken: true})
    console.log(response)
    if (response.status){
      chats.value = response.data
    } else {
      chatErrMsg.value = response.message
    }

    chatLoading.value = false
  }

  return {
    chats,
    chat,
    chatLoading,
    chatErrMsg,
    getChats
  }
})
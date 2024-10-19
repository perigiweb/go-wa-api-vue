<template>
  <div class="flex-1 h-full overflow-y-auto p-4">
    <div v-if="alert" class="static top-1 left-50% -translate-x-1/2">
      <div :class="alertClass">{{ alert.text }}</div>
    </div>

    <div class="w-full max-w-540px mt-12 mb-6 rounded bg-slate-800 mx-auto">
      <div class="border-0 border-b border-solid border-slate-700 pb-2 pt-4 px-4 flex justify-between items-center">
        <h3 class="font-bold text-size-lg">Send Message</h3>
        <button type="button" @click.prevent="closeMsgForm" class="border-0 py-1 px-2 cursor-pointer bg-transparent text-white"><font-awesome-icon icon="fad fa-times"></font-awesome-icon></button>
      </div>
      <form @submit.prevent="sendMessage" method="post" class="flex flex-1 flex-col space-y-4 p-4">
        <div>
          <label for="recipient" class="text-slate-400 font-size-xs block mb-1">WhatsApp Phone Number</label>
          <input type="text" v-model="recipient.phone" id="recipient"
            class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-size-sm invalid:border-red-400 valid:border-green-400"
            placeholder="WA Recipient Number (6281234567890)" required>
          <p v-if="contactName" class="text-slate-400 font-size-xs mt-1">Contact Name: <b>{{ contactName }}</b></p>
        </div>
        <div>
          <label for="message" class="text-slate-400 font-size-xs block mb-1">Message</label>
          <textarea id="message" rows="7" placeholder="Message" v-model="message" required @keyup="isTyping" :disabled="!isValidPhone"
            class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-size-sm invalid:border-red-400 valid:border-green-400"></textarea>
        </div>
        <div>
          <label for="file" class="text-slate-400 font-size-xs block mb-1">Photo or Video</label>
          <input type="file" id="file" @change="processFile" accept=".jpg,.jpeg,.png,.gif,.mp4,.3gp,.wmv,.avi,.mkv,.mov,.webm,webp"
            class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-size-sm">
        </div>
        <div v-if="uploadedFile" class="flex flex-wrap gap-2">
          <div v-if="isValidImage(uploadedFile)" class="relative max-w-45% p-1 h-auto border border-solid rounded border-slate-400 overflow-x-hidden">
            <button type="button" @click.prevent="removeFile"
              class="px-2 py-1 rounded-25% bg-slate-500 bg-opacity-80 border-0 text-slate-200 absolute right-5px top-5px"><font-awesome-icon icon="fad fa-times"></font-awesome-icon></button>
            <img :src="uploadedFile.data" class="w-100 h-auto rounded">
            <p class="whitespace-nowrap mt-2">{{ uploadedFile.name }}</p>
          </div>
        </div>
        <div>
          <button type="submit" class="btn btn-green" :disabled="isSending">{{ btnText }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useApi } from '../../plugins/useapi'
import { useDeviceStore } from '../../stores/device'
import { useContactStore } from '../../stores/contact'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes } from '@fortawesome/pro-duotone-svg-icons'

library.add(faTimes)

const { device, waContacts } = storeToRefs(useDeviceStore())
const { contact }    = storeToRefs(useContactStore())
const { getContact } = useContactStore()
const router         = useRouter()
const route          = useRoute()
const recipient      = ref({phone: '', inWA: 0})
const message        = ref('')
const uploadedFile   = ref(null)
const isSending      = ref(false)
const btnText        = ref('Send')
const alert          = ref(null)
const contactName    = ref('')
const isValidPhone   = ref(false)
const chatState      = ref('paused')
const typingTimer    = ref(null)

const alertClass = computed(() => {
  let c = ''
  if (alert.value){
    c = `${c} p-3 text-size-sm rounded w-auto mx-auto`
    switch(alert.value.type){
      case 'error':
        c = `${c} bg-red-300 text-red-900`
      break
      case 'success':
        c = `${c} bg-emerald-700 text-white`
      break
    }
  }
})

const closeMsgForm = () => {
  router.push({
    name: 'wa-state',
    params: {
      deviceId: device.id
    }
  })
}

const formatJID = (phone) => {
  return phone.replace(/^\+/, '').replace(/^0/, '62')
}

const isValidImage = (img) => {
  const imgTypes = [
    "image/apng",
    "image/gif",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/webp",
  ]

  return imgTypes.includes(img.mime)
}

const removeFile = () => {
  //const x = uploadedFiles.value.filter(f => f !== file)
  uploadedFile.value = null
}

const processFile = event => {
  //uploadedFiles.value = []
  const file = event.target.files[0]
  //for (const file of files){
    const r = new FileReader()
    r.onload = () => {
      uploadedFile.value = {
        name: file.name,
        size: file.size,
        mime: file.type,
        data: r.result
      }
    }

    r.readAsDataURL(file)
  //}

  event.target.value = ''

  console.log(event.target)
}

/*
const contactName = computed(() => {
  if (route.query.contactId && contact.value){
    return contact.value.name
  }

  return ''
})
*/

const { post } = useApi()
const sendMessage = async () => {
  if (route.query.contactId && contact.value && recipient.value.phone == contact.value.phone){
    recipient.value.inWA = contact.value.inWA
  }
  const mType = uploadedFile.value ? 'media':'text'
  console.log(recipient.value.phone, recipient.value.inWA, message.value, mType, uploadedFile.value)
  alert.value = null
  isSending.value = true
  if (!recipient.value.inWA){
    btnText.value = 'Checking recipient...'
    try {
      const r = await post(`me/wa/${device.value.id}/check-phone`, {
        json: {
          phones: [recipient.value.phone]
        },
        timeout: 30000,
        useAuthToken: true
      })
      if (r.status && r.data[0]?.IsIn){
        console.log(r.data)
        recipient.value.inWA = 1
      } else {
        alert.value = {
          text: 'Recipient not in WhatsApp.',
          type: 'error'
        }
      }
    } catch (err) {
      alert.value = {
        text: err.message,
        type: 'error'
      }
    }
  }

  if (recipient.value.inWA){
    if (typingTimer.value){
      clearTimeout(typingTimer.value)
    }
    btnText.value = 'Sending...'
    const data = {
      recipient: recipient.value.phone,
      message: message.value,
      mType,
      uploadedFile: uploadedFile.value
    }

    const res = await post(`me/wa/${device.value.id}/send`, {
      json: data,
      timeout: 30000,
      useAuthToken: true
    })

    alert.value = {
      text: res.status ? 'Message successfully sent':res.message,
      type: res.status ? 'success':'error'
    }

    if (res.status){
      message.value = ''
      uploadedFile.value = null
    }
  }

  isSending.value = false
  btnText.value   = 'Send'
}

const sendChatState = (state) => {
  const payload = {
    phone: recipient.value.phone,
    state,
    media: ''
  }

  post(`me/wa/${device.value.id}/send-chat-presence`, {
    json: payload,
    useAuthToken: true
  })
}
const isTyping = () => {
  chatState.value = 'composing'
  if (typingTimer.value){
    clearTimeout(typingTimer.value)
  }
  //console.log((new Date()).toLocaleTimeString())
  typingTimer.value = setTimeout(() => {
    chatState.value = 'paused'
    clearTimeout(typingTimer.value)
  }, 3000)
}
watch(() => chatState.value, (newChatState) => {
  console.log((new Date()).toLocaleTimeString(), newChatState)
  sendChatState(newChatState)
})

watch(() => recipient.value.phone, (newPhone, oldPhone) => {
  if (newPhone != oldPhone){
    recipient.value.phone = formatJID(newPhone)
    recipient.value.inWA = 0
    if (contact.value && formatJID(contact.value.phone) == newPhone){
      recipient.value.inWA = contact.value.inWA
    }

    isValidPhone.value = /^62(\d+){9,13}/.test(recipient.value.phone)
  }
})

if (route.query.contactId){
  if (route.query.contactId != contact.value?.id){
    getContact(route.query.contactId).then(c => {
      recipient.value.phone = formatJID(c.phone)
      recipient.value.inWA = c.inWA
      contactName.value = c.name
    })
  } else if (contact.value) {
    recipient.value.phone = formatJID(contact.value.phone)
    recipient.value.inWA = contact.value.inWA
    contactName.value = contact.value.name
  }
}
if (route.query.phone){
  recipient.value.phone = formatJID(route.query.phone)
  const waContact = waContacts.value.filter(c => c.phone === route.query.phone)[0] || null
  if (waContact){
    recipient.value.inWA = waContact.inWA
    contactName.value = waContact.name
  }
}
</script>
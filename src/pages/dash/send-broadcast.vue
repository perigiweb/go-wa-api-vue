<template>
  <div class="flex-1 h-full overflow-y-auto p-4">
    <alert v-if="alert" :type="alert.type" :autoclose="alert.autoclose || 5" @close="alert = null">{{ alert.text }}</alert>

    <div class="w-full max-w-540px mt-2 mb-6 rounded bg-slate-800 mx-auto">
      <div class="border-0 border-b border-solid border-slate-700 pb-2 pt-4 px-4 flex justify-between items-center">
        <h3 class="font-bold text-lg">Send Broadcast</h3>
        <button type="button" @click.prevent="closeMsgForm" class="border-0 py-1 px-2 cursor-pointer bg-transparent text-white"><font-awesome-icon icon="fad fa-times"></font-awesome-icon></button>
      </div>
      <form @submit.prevent="sendBroadcast" method="post" class="flex flex-1 flex-col space-y-4 p-4 group" novalidate>
        <div>
          <label for="campaignName" class="text-slate-400 font-size-xs block mb-1">Campaign Name</label>
          <input required type="text" name="campaignName" id="campaignName" v-model="campaignName"
            class="peer border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-sm group-[.was-validated]:invalid:border-red-400 group-[.was-validated]:valid:border-green-400">
          <p class="hidden text-red-300 text-sm group-[.was-validated]:peer-invalid:block">{{ errors.CampaignName||'Campaign Name is required field.' }}</p>
        </div>
        <div>
          <label for="contactType" class="text-slate-400 font-size-xs block mb-1">Recipient</label>
          <select v-model="contactType" name="contactType" id="contactType" class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-sm group-[.was-validated]:invalid:border-red-400 group-[.was-validated]:valid:border-green-400">
            <option value="w">WhatsApp Contacts ({{ waContacts.length }})</option>
            <option value="c">Contacts ({{ totalContact }})</option>
            <option value="p">Phone Number</option>
          </select>
        </div>
        <div>
          <div v-if="useContactFilter" class="flex gap-3">
            <div>
              <select v-model="contactFilter" :disabled="!useContactFilter" name="contactFilter" id="contactFilter"
                class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-sm group-[.was-validated]:invalid:border-red-400 group-[.was-validated]:valid:border-green-400">
                <option value="a">All Contacts</option>
                <option value="p">Phone Start With</option>
                <option value="n">Name Start With</option>
                <option v-if="contactType == 'c'" value="g">Contact Group</option>
              </select>
            </div>
            <div class="flex-1">
              <input type="text" v-model="filterValue" v-if="contactFilter !== 'a'" :list="contactGroupsData" required
                :disabled="!useContactFilter && contactFilter !== 'a'" name="filterValue"
                class="peer border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-sm group-[.was-validated]:invalid:border-red-400 group-[.was-validated]:valid:border-green-400">
              <p class="hidden text-red-300 text-sm group-[.was-validated]:peer-invalid:block">{{ errors.filterValue||'Filter Value is required field.' }}</p>
            </div>
          </div>
          <div v-if="contactType === 'p'" class="">
            <input type="text" name="phones" v-model="phones" :disabled="!(contactType === 'p')" required
              placeholder="6281122334455, 62895678909878"
              class="peer border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-sm group-[.was-validated]:invalid:border-red-400 group-[.was-validated]:valid:border-green-400">
            <p class="hidden text-red-300 text-sm group-[.was-validated]:peer-invalid:block">{{ errors.Phones||'Phone Number is required field.' }}</p>
          </div>
        </div>
        <div>
          <div class="flex justify-between items-center mb-1">
            <label for="message" class="text-slate-400 font-size-xs block">Message (min 100 characters)</label>
            <div class="text-slate-300 font-size-xs">{{ messageLength }}</div>
          </div>
          <textarea id="message" rows="7" placeholder="Message" v-model="message" required minlength="100"
            class="peer border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-sm group-[.was-validated]:invalid:border-red-400 group-[.was-validated]:valid:border-green-400"></textarea>
          <p class="hidden text-red-300 text-sm group-[.was-validated]:peer-invalid:block">{{ errors.Message||"Message is required and mininal 100 characters." }}</p>
        </div>
        <div>
          <label for="file" class="text-slate-400 font-size-xs block mb-1">Photo</label>
          <input type="file" id="file" @change="processFile" accept=".jpg,.jpeg,.png,.gif,.webp"
            class="text-slate-100 block w-full text-sm file:bg-slate-600 file:text-slate-100 file:py-2 file:px-3 file:border-0 file:rounded file:mr-4 file:font-semibold">
        </div>
        <div v-if="uploadedFile" class="flex flex-wrap gap-2">
          <div v-if="isValidImage(uploadedFile)" class="relative max-w-45% p-1 h-auto border border-solid rounded border-slate-400 overflow-x-hidden">
            <button type="button" @click.prevent="removeFile"
              class="px-2 py-1 rounded-25% bg-slate-500 bg-opacity-80 border-0 text-slate-200 absolute right-5px top-5px"
            ><font-awesome-icon icon="fad fa-times"></font-awesome-icon></button>
            <img :src="uploadedFile.data" class="w-100 h-auto rounded">
          </div>
        </div>
        <div>
          <label for="sent_started_at" class="text-slate-400 font-size-xs block mb-1">Sent Started At</label>
          <input type="datetime-local" id="sent_started_at" v-model="sentStartedAt"
            class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-sm group-[.was-validated]:invalid:border-red-400 group-[.was-validated]:valid:border-green-400">
        </div>
        <div>
          <button type="submit" class="btn btn-green" :disabled="isSending">{{ btnText }}</button>
        </div>
      </form>
    </div>
  </div>
  <datalist id="contact-groups">
    <option v-for="cg in contactGroups" :value="cg.name"></option>
  </datalist>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useApi } from '../../plugins/useapi'
import { fmtDateForInput } from '../../utils'

import { useDeviceStore } from '../../stores/device'
import { useContactStore } from '../../stores/contact'

import Alert from '../../components/Alert.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes } from '@fortawesome/pro-duotone-svg-icons'

library.add(faTimes)

const router = useRouter()

const { device, waContacts }          = storeToRefs(useDeviceStore())
const { totalContact, contactGroups } = storeToRefs(useContactStore())

const now = new Date()
now.setHours(now.getHours() + 7)

const campaignName   = ref('')
const contactType    = ref('c')
const contactFilter  = ref('a')
const filterValue    = ref('')
const phones         = ref('')
const message        = ref('')
const uploadedFile   = ref(null)
const sentStartedAt  = ref(fmtDateForInput(now))
const isSending      = ref(false)
const btnText        = ref('Send')
const alert          = ref(null)
const errors         = ref({})

const messageLength = computed(() => message.value.length)
const useContactFilter = computed(() => (contactType.value === 'w' || contactType.value === 'c'))
const contactGroupsData = computed(() => contactFilter.value == 'g' ? 'contact-groups':null)
const closeMsgForm = () => {
  router.push({
    name: 'wa-state',
    params: {
      deviceId: device.id,
      c: 'broadcasts'
    }
  })
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
}

const { post } = useApi()
const sendBroadcast = async (event) => {
  errors.value = {}

  if ( !event.target.checkValidity()){
    event.target.classList.add('was-validated')
    return false
  }

  const mType = uploadedFile.value ? 'media':'text'
  message.value = message.value.trim()

  alert.value = null
  isSending.value = true
  btnText.value = 'Sending...'

  const p = phones.value.split(',').map(x => x.trim().replace(/^0/, '62')).filter(x => x !== '')
  const d = new Date(sentStartedAt.value)
  let fv = filterValue.value.trim()
  if (contactFilter.value === 'g'){
    const cg = contactGroups.value.filter(z => z.name === fv)[0] || null
    if ( !cg){
      alert.value = {
        type: 'error',
        text: `Contact group with value: ${filterValue.value} not found.`
      }
      return false
    }

    fv = `${cg.id}:${cg.name}`
  }
  d.setHours(d.getHours() - 7)
  const data = {
    campaignName: campaignName.value.trim(),
    contactType: contactType.value,
    contactFilter: contactFilter.value,
    filterValue: fv,
    phones: p.length == 0 ? null:p,
    message: message.value,
    mType,
    media: uploadedFile.value,
    sentStartedAt: d.toISOString()
  }

  const res = await post(`me/wa/${device.value.id}/broadcast`, {
    json: data,
    timeout: 30000,
    useAuthToken: true
  })

  if (typeof res.message === 'object'){
    for(const i in res.message){
      const m = res.message[i]
      const k = i.split('.')[1]

      errors.value[k] = m
    }
  } else {
    alert.value = {
      text: res.status ? 'Broadcast message successfully saved':res.message,
      type: res.status ? 'success':'error'
    }
  }

  isSending.value = false
  btnText.value = 'Send'
}
</script>

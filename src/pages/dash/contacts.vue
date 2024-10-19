<template>
  <alert v-if="alert" :type="alert.type" @close="alert = null">{{ alert.text }}</alert>
  <div class="flex flex-row h-full w-full">
    <div class="w-360px shrink-0 h-full bg-slate-800 flex flex-col">
      <div class="h-48px bg-slate-800 flex items-center justify-between bg-slate-900 px-3 border-0 border-b border-solid border-slate-800">
        <h1 class="font-size-lg">Contacts</h1>
        <div class="flex gap-1">
          <button @click.prevent="showImportForm" class="py-1 px-2 rounded border-1 border-green-600 bg-green-700 text-light font-size-sm cursor-pointer hover:bg-green-800">Import</button>
          <button @click.prevent="showForm" class="py-1 px-2 rounded border-1 border-green-600 bg-green-700 text-light font-size-sm cursor-pointer hover:bg-green-800">Add New</button>
        </div>
      </div>
      <div class="relative">
        <span class="flex items-center absolute left-1.25rem top-0 bottom-0 text-white"><font-awesome-icon icon="fad fa-search"></font-awesome-icon></span>
        <span v-if="searchQuery" @click.prevent="clearSearchQuery" class="flex items-center absolute right-1.25rem top-0 bottom-0 text-white cursor-pointer"><font-awesome-icon icon="fad fa-times"></font-awesome-icon></span>
        <input type="text" v-model="searchQuery" @keydown.enter.prevent="searchContact"
          class="border border-0 bg-slate-600 text-white py-2 pl-2.75rem pr-3 outline-none w-full text-size-sm"
          placeholder="Search by Name or Phone">
      </div>
      <div v-if="error" class="bg-red-300 text-red-900 p-2 text-size-sm h-auto">{{ error }}</div>
      <div class="flex-1 overflow-y-auto">
        <loading :state="loadingState" class="p-3"></loading>
        <div v-if="contacts.length == 0 && !loadingState && !error" class="p-3 text-center text-size-sm">No contact found.</div>
        <div v-if="contacts.length" class="flex flex-col gap-1">
          <div v-for="_contact in contacts" class="relative hover:bg-slate-700">
            <div class="absolute right-0 top-0 bottom-0 flex gap-1 items-center px-2">
              <font-awesome-icon icon="fad fa-check-circle" :class="_contact.inWA ? 'text-green':'text-slate-600'"></font-awesome-icon>
              <button class="bg-transparent border-0 cursor-pointer text-slate-400 hover:text-slate-200" @click.prevent="editContact(_contact)"><font-awesome-icon icon="fad fa-edit"></font-awesome-icon></button>
              <button class="bg-transparent border-0 cursor-pointer text-red-400 hover:text-red-200" @click.prevent="delContact(_contact.id)"><font-awesome-icon icon="fad fa-trash"></font-awesome-icon></button>
            </div>
            <button class="flex-1 btn-no-border block leading-none bg-transparent text-light text-left w-full"
              @click.prevent="showSelectDevice(_contact)">
              <b class="block">{{ _contact.name }}</b>
              <small>{{ fmtPhoneNumber(_contact.phone) }}</small>
            </button>
          </div>
        </div>
      </div>
      <div class="flex items-center bg-slate-900">
        <button :disabled="!prevPage" @click.prevent="currentPage--" class="btn bg-transparent border-0 text-white hover:bg-slate-800 rounded-none disabled:text-slate-400 disabled:hover:bg-slate-900 disabled:cursor-default"><font-awesome-icon icon="fad fa-chevron-left"></font-awesome-icon></button>
        <div class="flex-1 text-center py-2 text-xs" v-html="dataOfTotal"></div>
        <button :disabled="!nextPage" @click.prevent="currentPage++" class="btn bg-transparent border-0 text-white hover:bg-slate-800 rounded-none disabled:text-slate-400 disabled:hover:bg-slate-900 disabled:cursor-default"><font-awesome-icon icon="fad fa-chevron-right"></font-awesome-icon></button>
      </div>
    </div>
    <div class="flex flex-col flex-1 h-full relative">
      <div v-if="successMsg" class="bg-emerald-700 text-white p-3 m-3 text-size-sm rounded fixed top-.25rem left-0 right-0">{{ successMsg }}</div>
      <div class="px-3 py-20 flex justify-center">
        <form v-if="contactFormShown" method="post" @submit.prevent="saveContact" class="flex flex-1 flex-col space-y-4 w-full max-w-360px rounded bg-slate-800 p-4">
          <div class="border-0 border-b border-solid border-slate-700 font-bold text-size-lg pb-2">{{ formTitle }}</div>
          <div class="space-y-2">
            <div>
              <input type="text" name="name" v-model="contact.name" class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-size-sm" placeholder="Name">
              <p v-if="errors.Name" class="text-red-300 text-sm mt-1">{{ errors.Name }}</p>
            </div>
            <div>
              <input type="text" name="phone" v-model="contact.phone" class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-size-sm"
                placeholder="Phone (6281122334477)">
              <p v-if="errors.Phone" class="text-red-300 text-sm mt-1">{{ errors.Phone }}</p>
            </div>
            <tag-input v-model="contact.groups"></tag-input>
          </div>
          <div class="flex justify-between">
            <button type="submit" class="btn btn-green font-bold" :disabled="isSaving">{{ saveBtnText }}</button>
            <button type="button" @click.prevent="hideForm" class="btn bg-slate-500 font-bold text-slate-100 hover:bg-slate-600">Close</button>
          </div>
        </form>
        <form v-if="importFormShown" method="post" @submit.prevent="importContact" class="flex flex-1 flex-col space-y-4 w-full max-w-360px rounded bg-slate-800 p-4">
          <div class="border-0 border-b border-solid border-slate-700 font-bold text-size-lg pb-2">Import Contact</div>
          <div class="space-y-2">
            <div class="text-sm text-slate-400">Select JSON file with format: <pre class="bg-slate-700 rounded p-1">[
  {
    name: "",
    phone: "",
    group: "group-1, group-2"
  }
]</pre></div>
            <input type="file" name="f" @change="processFile" accept=".json"
              class="text-slate-100 block w-full text-sm file:bg-slate-600 file:text-slate-100 file:py-2 file:px-3 file:border-0 file:rounded file:mr-4 file:font-semibold">
            <p v-if="errors.UploadedFile" class="text-red-300 text-sm">{{ errors.UploadedFile }}</p>
          </div>
          <div class="flex justify-between">
            <button type="submit" class="btn btn-green font-bold" :disabled="isSaving">{{ importBtnText }}</button>
            <button type="button" @click.prevent="hideForm" class="btn bg-slate-500 font-bold text-slate-100 hover:bg-slate-600">Close</button>
          </div>
        </form>
        <div v-if="deviceSelectorShown" class="flex flex-1 flex-col space-y-4 w-full max-w-360px rounded bg-slate-800 p-4">
          <div class="border-0 border-b border-solid border-slate-700 font-bold text-size-lg pb-2 flex justify-between items-center">
            <span>Select WhatsApp Account</span>
            <button type="button" @click.prevent="closeDeviceSelector" class="border-0 py-1 px-2 cursor-pointer bg-transparent text-white"><font-awesome-icon icon="fad fa-times"></font-awesome-icon></button>
          </div>
          <div class="text-size-sm">
            <div class="text-slate-400">Send message to</div>
            <div>{{ fmtPhoneNumber(contact.phone) }} ({{ contact.name }})</div>
          </div>
          <div v-if="devicesWithJid.length" class="flex flex-col gap-2">
            <router-link v-for="device in devicesWithJid" class="flex items-center gap-2 btn-no-border block leading-none bg-slate-700 rounded hover:bg-slate-600"
              :to="{name: 'wa-send', params: {deviceId: device.id}, query: {contactId: contact.id}}">
              <font-awesome-icon icon="fad fa-comment-alt" class="font-size-3xl"></font-awesome-icon>
              <div class="leading-none flex-1">
                <b class="block">{{ device.name }}</b>
                <small>{{ fmtPhoneNumber(device.jid) }}</small>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, watchEffect, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useContactStore } from '../../stores/contact'
import { useDeviceStore } from '../../stores/device'
import { useAuthStore } from '../../stores/auth'
import { fmtPhoneNumber } from '../../utils'

import Alert from '../../components/Alert.vue'
import Loading from '../../components/Loading.vue'
import TagInput from '../../components/TagInput.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEdit, faTrash, faChevronLeft, faChevronRight, faCheckCircle, faSearch, faTimes, faCommentAlt } from '@fortawesome/pro-duotone-svg-icons'

library.add(faEdit, faTrash, faChevronLeft, faChevronRight, faCheckCircle, faSearch, faTimes, faCommentAlt)

const contactStore = useContactStore()
const {
  contacts,
  dataOfTotal,
  nextPage,
  prevPage,
  currentPage,
  contact,
  searchQuery
} = storeToRefs(contactStore)

const { devicesWithJid }  = storeToRefs(useDeviceStore())
const { userId }          = storeToRefs(useAuthStore())
const contactFormShown    = ref(false)
const importFormShown     = ref(false)
const deviceSelectorShown = ref(false)
const loadingState        = ref(false)
const error               = ref()
const errors              = ref({})
const saveError           = ref()
const isSaving            = ref(false)
const successMsg          = ref()
const alert               = ref(null)
const importedFile        = ref(null)

const saveBtnText = computed(() => {
  return isSaving.value ? 'Saving...':'Save'
})

const importBtnText = computed(() => {
  return isSaving.value ? 'Importing...':'Import'
})

const formTitle = computed(() => {
  return contact.value.id ? 'Edit Contact':'Add New Contact'
})

const showForm = () => {
  //formTitle.value = 'Add New Contact'
  deviceSelectorShown.value = false
  importFormShown.value = false
  contactFormShown.value = true
  contact.value = {id: null, userId: userId.value, name: '', phone: '', inWA: 0, groups: []}
  saveError.value = null
}

const showImportForm = () => {
  deviceSelectorShown.value = false
  contactFormShown.value = false
  importFormShown.value = true
  saveError.value = null
}

const hideForm = () => {
  deviceSelectorShown.value = false
  importFormShown.value = false
  contactFormShown.value = false
  contact.value = {id: null, userId: userId.value, name: '', phone: '', inWA: 0, groups: []}
  saveError.value = null
}

const editContact = (_contact) => {
  //formTitle.value = 'Edit Contact'
  contactFormShown.value = true
  importFormShown.value = false
  deviceSelectorShown.value = false
  contact.value = _contact
  saveError.value = null
}

const delContact = async (contactId) => {
  contactStore.delContact(contactId).then(() => {
    successMsg.value = "Contact successfully deleted."
  }).catch(err => {
    error.value = err
  })
}

const processFile = event => {
  const file = event.target.files[0]
  const r = new FileReader()
  r.onload = () => {
    importedFile.value = r.result
  }

  r.readAsDataURL(file)
}

const saveContact = async (event) => {
  errors.value = {}
  isSaving.value = true

  contactStore.saveContact().then(response => {
    if (typeof response.message === 'object'){
      for(const i in response.message){
        const m = response.message[i]
        const k = i.split('.')[1]

        errors.value[k] = m
      }
    } else {
      alert.value = {
        type: response.status ? 'success':'error',
        text: response.message ? response.message:(response.status ? 'Contact successfully saved.':'Contact save failed.')
      }
    }
  }).catch(err => {
    alert.value = {
      type: 'error',
      text: err.message
    }
  }).finally(() => {
    isSaving.value = false
  })
}

const importContact = () => {
  errors.value = {}
  isSaving.value = true

  contactStore.importContact(importedFile.value).then(response => {
    if (typeof response.message === 'object'){
      for(const i in response.message){
        const m = response.message[i]
        const k = i.split('.')[1]

        errors.value[k] = m
      }
    } else {
      alert.value = {
        type: response.status ? 'success':'error',
        text: response.message ? response.message:(response.status ? 'Contact successfully imported.':'Contact import failed.')
      }
    }
  }).catch(err => {
    alert.value = {
      type: 'error',
      text: err.message
    }
  }).finally(() => {
    isSaving.value = false
  })
}

const showSelectDevice = _contact => {
  contactFormShown.value = false
  importFormShown.value = false
  deviceSelectorShown.value = true

  contact.value = _contact
}

const closeDeviceSelector = () => {
  deviceSelectorShown.value = false
}

const searchContact = () => {
  loadingState.value = true
  currentPage.value = 1
  contactStore.getContacts().catch((err) => {
    error.value = err.message
  }).finally(() => {
    loadingState.value = false
  })
}

const clearSearchQuery = () => {
  searchQuery.value = ''
  searchContact.call()
}

const getContacts = () => {
  if ( !loadingState.value){
    loadingState.value = true
    contactStore.getContacts().catch((err) => {
      error.value = err.message
    }).finally(() => {
      loadingState.value = false
    })
  }
}

watch(currentPage, () => {
  getContacts()
})

watchEffect(() => {
  let te, tse, tm
  if (te){
    clearTimeout(te)
  }
  if (tm){
    clearTimeout(tm)
  }
  if (tse){
    clearTimeout(tse)
  }
  if (error.value){
    te = setTimeout(() => {
      error.value = null
    }, 4000)
  }
  if (saveError.value){
    tse = setTimeout(() => {
      saveError.value = null
    }, 5000)
  }
  if (successMsg.value){
    tm = setTimeout(() => {
      successMsg.value = null
    }, 5000)
  }
})

getContacts()
</script>
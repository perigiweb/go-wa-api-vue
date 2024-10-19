<template>
  <div class="flex-1 h-full overflow-y-auto p-4">
    <alert v-if="alert" :type="alert.type" :autoclose="alert.autoclose || 5" @close="alert = null">{{ alert.text }}</alert>

    <div class="w-full max-w-380px mt-2 mb-6 rounded bg-slate-800 mx-auto">
      <div class="border-0 border-b border-solid border-slate-700 pb-2 pt-4 px-4 flex justify-between items-center">
        <h3 class="font-bold text-lg">My Account</h3>
      </div>
      <form @submit.prevent="saveProfile" method="post" class="flex flex-1 flex-col space-y-4 p-4 group" novalidate>
        <div>
          <label for="campaignName" class="text-slate-400 font-size-xs block mb-1">Name</label>
          <input required type="text" name="campaignName" id="campaignName" v-model="name"
            class="peer border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-sm group-[.was-validated]:invalid:border-red-400 group-[.was-validated]:valid:border-green-400">
          <p class="hidden text-red-300 text-sm group-[.was-validated]:peer-invalid:block">{{ errors.Name||'Name is required field.' }}</p>
        </div>
        <div>
          <label for="email" class="text-slate-400 font-size-xs block mb-1">Email</label>
          <input required type="email" name="email" id="email" v-model="email"
            class="peer border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-sm group-[.was-validated]:invalid:border-red-400 group-[.was-validated]:valid:border-green-400">
          <p class="hidden text-red-300 text-sm group-[.was-validated]:peer-invalid:block">{{ errors.Email||'Email is required field and must be a valid email.' }}</p>
        </div>
        <div>
          <label for="password" class="text-slate-400 font-size-xs block mb-1">Password (<small>Fill to change your password</small>)</label>
          <input type="password" name="password" id="password" v-model="password"
            class="peer border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-sm group-[.was-validated]:invalid:border-red-400 group-[.was-validated]:valid:border-green-400">
          <p class="hidden text-red-300 text-sm group-[.was-validated]:peer-invalid:block">{{ errors.Password }}</p>
        </div>
        <div>
          <button type="submit" class="btn btn-green" :disabled="isSaving">{{ btnText }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../../stores/auth'

import Alert from '../../components/Alert.vue'

const {userName, userEmail} = useAuthStore()

const name     = ref(userName)
const email    = ref(userEmail)
const password = ref('')
const alert    = ref(null)
const errors   = ref({})
const isSaving = ref(false)
const btnText  = ref('Update Account')

const saveProfile = (event) => {
  errors.value = {}
  alert.value = null

  if ( !event.target.checkValidity()){
    event.target.classList.add('was-validated')
    return false
  }

  isSaving.value = true
  btnText.value  = 'Updating...'
}
</script>
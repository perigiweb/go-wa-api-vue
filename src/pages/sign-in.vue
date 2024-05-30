<template>
  <div class="flex flex-col-reverse md:flex-row mx-auto gap-12 md:gap-4">
    <div class="flex-1">
      <p>
        <router-link to="/sign-up">
          Don't have an account yet?? Sign up here
        </router-link>
      </p>
      <p>
        <router-link to="/">
          Back to Home
        </router-link>
      </p>
    </div>
    <div class="w-full max-w-360px rounded bg-slate-800 flex flex-col gap-3">
      <h2 class="text-xl border-0 border-b border-solid border-slate-700 font-bold text-size-lg px-3 py-2">Sign In</h2>
      <form @submit.prevent="submitSignIn" method="post" class="p-3">
        <div class="mb-2"><input type="email" name="email" v-model="email" required placeholder="Email"
          class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-size-sm" autocomplete="off"></div>
        <div class="mb-3"><input type="password" name="password" v-model="password" required placeholder="Password"
          class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-size-sm"></div>
        <button type="submit" class="btn btn-green" :disabled="isSigningIn">{{ btnText }}</button>
      </form>
      <div v-if="authErrMsg" class="bg-red-300 text-red-900 rounded p-3 mx-3 text-size-sm leading-tight mb-3">{{ authErrMsg }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const currentRoute = useRoute()
const { signIn } = useAuthStore()
const { authErrMsg } = storeToRefs(useAuthStore())

const errMsg = ref('')
const email = ref('')
const password = ref('')
const isSigningIn = ref(false)
const btnText = computed(() => isSigningIn.value ? 'Signing in...':'Sign In')

const submitSignIn = async () => {
  isSigningIn.value = true
  errMsg.value = ''

  signIn(email.value, password.value).then((status) => {
    if (status){
      router.push({ path: currentRoute.query.next || '/dash' })
    } else {
      isSigningIn.value = false
    }
  })
}
</script>
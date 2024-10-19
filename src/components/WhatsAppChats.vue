<template>
  <div v-if="chatErrMsg" class="bg-red-300 text-red-900 p-2 text-sm h-auto">{{ chatErrMsg }}</div>
  <div class="flex-1 overflow-y-auto">
    <loading :state="chatLoading" class="p-3"></loading>
    <div v-if="chats.length == 0 && !chatLoading && !chatErrMsg" class="p-3 text-center text-size-sm">No chats found.</div>
    <div v-if="chats.length" class="flex flex-col">
      <div v-for="c in chats" class="flex justify-between items-center gap-1 border-b border-solid border-slate-500 hover:bg-slate-700 w-full has-[:disabled]:bg-slate-700">
        <button class="flex-1 btn-no-border py-3 block leading-none bg-transparent text-light text-left truncate disabled:opacity-50 disabled:cursor-not-allowed"
          @click.prevent="show(c)">
          <b class="block">{{ c.pushName }}</b>
          <small>{{ fmtDate(c.timestamp) }}</small>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { fmtDate } from '../utils'

import { useChatStore } from '../stores/chat'

import Loading from './Loading.vue'

const { chats, chat, chatLoading, chatErrMsg } = storeToRefs(useChatStore())
const { getChats } = useChatStore()

const show = (c) => {
  chat.value = c
  console.log(chat.value)
}

onMounted(() => {
  getChats()
})
</script>
<template>
  <alert v-if="alert" :type="alert.type" @close="alert = null" autoclose="5">{{ alert.message }}</alert>
  <div class="flex-1 h-full overflow-auto p-4">
    <div v-if="broadcast">
      <div class="h-48px bg-slate-800 flex items-center justify-between bg-slate-900 px-3 border-0 border-b border-solid border-slate-800">
        <h1 class="text-base font-semibold leading-none">{{ broadcast.name }}</h1>
      </div>
    </div>
    <pre>{{ broadcast }}</pre>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDeviceStore } from '../../stores/device'
import Alert from '../../components/Alert.vue'

const { device }     = useDeviceStore()

const broadcast      = ref()
const alert          = ref(null)
</script>
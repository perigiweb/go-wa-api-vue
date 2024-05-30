<template>
  <div class="container px-4 mx-auto">
    <div class="mb-4 py-3 text-center"><h1>Another WhatsApp App</h1></div>
    <router-view v-slot="{ Component }">
      <component :is="Component" :key="route.path" />
    </router-view>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
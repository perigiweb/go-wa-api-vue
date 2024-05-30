<template>
  <div class="flex flex-row h-screen">
    <sidebar></sidebar>
    <main class="flex-1 h-full overflow-x-hidden overflow-y-auto">
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" :key="$route.path" />
        </transition>
      </router-view>
    </main>
  </div>
</template>
<script setup>
import Sidebar from '../components/Sidebar.vue'
</script>
<template>
  <div class="p-4">
    <h2 class="text-4 text-center font-normal">Welcome back <span class="text-orange-700 font-bold"
      >{{ userName }}</span></h2>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../../stores/auth'

const { userName } = storeToRefs(useAuthStore())
</script>
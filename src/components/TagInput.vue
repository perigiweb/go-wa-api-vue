<template>
  <div class="flex flex-col space-y-1">
    <div class="flex flex-wrap gap-1">
      <span v-for="tag in tags" @click.prevent="removeTag(tag)"
        class="inline-flex items-center px-2 py-1 text-sm bg-yellow-200 text-yellow-900 rounded cursor-pointer">{{ tag }}</span>
    </div>
    <input type="text" name="phone" @keydown.enter.prevent="addTag" @blur.prevent="addTag" class="border border-slate-400 bg-slate-700 text-slate-100 rounded py-2 px-3 w-full text-size-sm"
      placeholder="Group name (press Enter to add)">
  </div>
</template>
<script setup>
const tags = defineModel()
const addTag = event => {
  const newGroup = event.target.value.trim()
  if (newGroup != ''){
    if ( !tags.value.includes(newGroup)){
      tags.value.push(newGroup)
    }
    event.target.value = ''
  }
}
const removeTag = t => {
  tags.value = tags.value.filter(x => x !== t)
}
</script>
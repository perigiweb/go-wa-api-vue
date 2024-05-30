import { defineStore } from "pinia"

export const useLoadingStore = defineStore('loadingState', {
  state: () => {
    return {
      loading: false
    }
  }
})
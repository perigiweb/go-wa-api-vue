import { ref, computed } from 'vue'
import { defineStore } from "pinia"
import { useApi } from '../plugins/useapi'

export const useContactStore = defineStore('contact', () => {
  const api = useApi()

  const contacts    = ref([])
  const contact     = ref({id: null, userId: 0, name: '', phone: '', inWA: 0})
  const total       = ref(0)
  const limit       = ref(100)
  const nextPage    = ref('')
  const prevPage    = ref('')
  const currentPage = ref(1)
  const searchQuery = ref('')
  const totalContactInWA = ref(0)

  const hasContacts = computed(() => contacts.value.length ? true:false)
  const dataOfTotal = computed(() => {
    const min = ((currentPage.value - 1) * limit.value) + 1
    let max = currentPage.value * limit.value
    if (max > total.value){
      max = total.value
    }

    return total.value > 0 ? `${min}&ndash;${max} of ${total.value}`:'&nbsp;'
  })

  function getTotalContacts(){
    api.get('me/total-contacts', {useAuthToken: true}).then(response => {
      if (response.status){
        totalContactInWA.value = response.data
      }
    })
  }

  getTotalContacts()

  async function getContacts(){
    contacts.value = []
    total.value = 0
    nextPage.value = ''
    prevPage.value = ''

    const s = new URLSearchParams()
    s.set('page', currentPage.value)
    //if (searchQuery != ''){
    s.set('q', searchQuery.value)
    //}

    const response = await api.get(`me/contacts?${s.toString()}`, {useAuthToken: true})

    if (response.status){
      contacts.value = response.data.contacts || []
      total.value    = response.data.total
      limit.value    = response.data.limit
      nextPage.value = response.data.nextPage
      prevPage.value = response.data.prevPage

      return true
    }

    throw new Error(response.message)
  }
  async function getContact(contactId){
    contact.value = contacts.value.filter(c => c.id == contactId)[0] || null
    if ( !contact.value){
      const response = await api.get(`me/contact/${contactId}`, {useAuthToken: true})
      if (response.status){
        contact.value = response.data

        return contact.value
      }

      throw new Error(response.message)
    }
  }
  async function saveContact(){
    const response = await api.post('me/contact', {
      json: contact.value,
      useAuthToken: true
    })
    if (response.status){
      if (!contact.value.id)
        contacts.value.unshift(response.data)

      return true
    }

    throw new Error(response.message)
  }
  async function delContact(contactId){
    const response = await api.delete(`me/contact/${contactId}`, {useAuthToken: true})
    if (response.status){
      contacts.value = contacts.value.filter(c => c.id != contactId)
      return true
    }

    throw new Error(response.message)
  }

  return {
    contacts,
    contact,
    total,
    totalContact: totalContactInWA,
    limit,
    nextPage,
    prevPage,
    currentPage,
    searchQuery,
    hasContacts,
    dataOfTotal,
    getContacts,
    getContact,
    saveContact,
    delContact
  }
})
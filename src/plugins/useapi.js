import { inject, unref } from 'vue'
import { storeToRefs } from 'pinia'
import ky from 'ky'
import { useAuthStore } from '../stores/auth'

export function useApi() {
  return inject('fetchApi')
}

export default function createApi(options) {
  const apiBaseUrl = options.apiBaseUrl || ''
  const router = options.router || null

  if ( !router){
    throw new Error("missing options.router, instance of vue-router")
  }

  async function _fetch(input, reqOptions){
    const { authErrMsg } = storeToRefs(useAuthStore())
    const { getToken, deleteToken } = useAuthStore()
    const currentRoute = unref(router.currentRoute)

    reqOptions = reqOptions || {}

    reqOptions.prefixUrl = apiBaseUrl
    if (reqOptions.useAuthToken){
      const _token = await getToken()
      if ( !_token){
        router.push({
          name: 'sign-in',
          query: {
            next: currentRoute.fullPath
          }
        })
      }
      reqOptions.headers = {
        Authorization: `Bearer ${_token || ''}`
      }

      delete reqOptions.useAuthToken
    }

    try {
      return await ky(input, reqOptions).json()
    } catch (err) {
      let m = err.message
      if (err.response){
        try {
          const j = await err.response.json()
          if (j.message){
            m = j.message
          }
        } catch (e){}
      }
      if ([401, 403].includes(err.response?.status)){
        authErrMsg.value = m
        deleteToken()
        router.push({
          name: 'sign-in',
          query: {
            next: currentRoute.fullPath
          }
        })
        return
      }
      if (err.response?.status === 404){
        m = `${input} Not Found`
      }
      return {
        status: false,
        message: m
      }
    }
  }

  function post(input, reqOptions){
    reqOptions = reqOptions || {}
    reqOptions.method = 'POST'
    return _fetch(input, reqOptions)
  }

  function get(input, reqOptions){
    reqOptions = reqOptions || {}
    reqOptions.method = 'GET'
    return _fetch(input, reqOptions)
  }

  function _delete(input, reqOptions){
    reqOptions = reqOptions || {}
    reqOptions.method = 'DELETE'
    return _fetch(input, reqOptions)
  }

  function patch(input, reqOptions){
    reqOptions = reqOptions || {}
    reqOptions.method = 'PATCH'
    return _fetch(input, reqOptions)
  }

  function put(input, reqOptions){
    reqOptions = reqOptions || {}
    reqOptions.method = 'PUT'
    return _fetch(input, reqOptions)
  }

  const fetchApi = {
    fetch: _fetch,
    get,
    post,
    delete: _delete,
    patch,
    put,

    install(app){
      const fetchApi = this

      app.provide('fetchApi', fetchApi)

      app.config.globalProperties.$fetchApi = fetchApi
    }
  }

  return fetchApi
}
import { ref, computed } from 'vue'
import { defineStore } from "pinia"
import { useApi } from '../plugins/useapi'

const TOKEN_KEY = 'authToken'
const REFRESH_TOKEN_KEY = 'authRefreshToken'

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()

  const decodeToken = (encodedToken) => {
    if (encodedToken && typeof encodedToken === 'string') {
      const firstSeparator = encodedToken.indexOf('.')
      const lastSeparator = encodedToken.lastIndexOf('.')

      if (firstSeparator === -1 || firstSeparator >= lastSeparator) {
        throw new Error('The token is malformed.')
      }

      let tokenPayload = encodedToken.slice(firstSeparator + 1, lastSeparator)
      tokenPayload = JSON.parse(atob(tokenPayload))

      if (!tokenPayload || typeof tokenPayload !== 'object') {
        throw new Error(`Cannot parse token payload.`)
      }

      const tokenExpDate = new Date(tokenPayload.exp * 1000);
      if (Date.now() > tokenExpDate){
        console.log('Token Expired!');
        //localStorage.removeItem(TOKEN_KEY)
        //return null;
        //const t = await getToken()
        //console.log({t})
        //if (t){
        //  return await decodeToken(t)
        //}

        //return null
      }

      return tokenPayload
    }

    return null
  }

  const token        = ref(localStorage.getItem(TOKEN_KEY))
  const refreshToken = ref(localStorage.getItem(REFRESH_TOKEN_KEY))
  const payload      = ref(decodeToken(token.value))
  const authErrMsg   = ref(null)

  //if (token.value){
  //  decodeToken(token.value).then((tokenPayload) => {
  //    console.log({tokenPayload})
  //    payload.value = tokenPayload
  //  })
  //}

  const isLoggedIn = computed(() => {
    if ( !payload.value){
      return false
    }
    //const tokenExpDate = new Date(payload.value.exp * 1000);
    //if (Date.now() > tokenExpDate){
    //  return false
    //}

    return true
  })
  const userId   = computed(() => payload.value?.userId || 0)
  const userName = computed(() => payload.value?.name || '')

  const isTokenExpired = () => {
    const tokenExpDate = new Date(payload.value.exp * 1000)
    return (Date.now() > tokenExpDate)
  }

  async function getToken(){
    if (token.value && isTokenExpired()){
      authErrMsg.value = null
      const r = await api.get('refresh-token', {
        headers: {
          Authorization: `Bearer ${refreshToken.value || ''}`
        }
      })
      if (r.status){
        setToken(r.data.token, r.data.refreshToken)
      } else {
        authErrMsg.value = r.message || 'Failed to Sign in with refresh token'
        deleteToken()
      }
    }

    return token.value
  }
  function setToken(jwtToken, jwtRefreshToken) {
    token.value = jwtToken
    refreshToken.value = jwtRefreshToken
    payload.value = decodeToken(token.value)

    localStorage.setItem(TOKEN_KEY, token.value)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken.value)
  }
  function deleteToken() {
    token.value = null
    refreshToken.value = null
    payload.value = null

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
  async function signIn(userEmail, userPassword){
    authErrMsg.value = null
    const r = await api.post('sign-in', {json: {userEmail, userPassword}})
    if (r.status && r.data.token){
      setToken(r.data.token, r.data.refreshToken)

      return true
    }

    //throw new Error(r.message)
    authErrMsg.value = r.message
    return false
  }
  async function signOut(){
    const sessionId = payload.value.session

    await api.post('sign-out', {json: {sessionId}})

    deleteToken()

    return true
  }

  return {
    token,
    refreshToken,
    payload,
    authErrMsg,
    isLoggedIn,
    userId,
    userName,
    getToken,
    deleteToken,
    signIn,
    signOut
  }
})
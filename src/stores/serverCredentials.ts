import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useServerCredentialsStore = defineStore('serverCredentials', () => {
  const url = useLocalStorage('gitlabApiUrl', '')
  const token = useLocalStorage('gitlabApiToken', '')

  function updateCredentials(newUrl: string, newToken: string): void {
    url.value = newUrl
    token.value = newToken
  }

  return {
    url,
    token,
    updateCredentials,
  }
})

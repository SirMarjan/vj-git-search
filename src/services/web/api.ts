import axios from 'axios'
import { useServerCredentialsStore } from '@/stores/serverCredentials'

export const gitlabApi = axios.create()

gitlabApi.interceptors.request.use((config) => {
  const store = useServerCredentialsStore()
  config.baseURL = store.url + '/api/v4'
  config.headers['PRIVATE-TOKEN'] = store.token
  return config
})

export type Raw<T> = T & Record<string, unknown>

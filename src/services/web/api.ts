import axios from 'axios'

export const gitlabApi = axios.create({
  baseURL: import.meta.env.VITE_GITLAB_BASE_URL,
  headers: {
    'PRIVATE-TOKEN': import.meta.env.VITE_GITLAB_PRIVATE_TOKEN,
  },
})

export type Raw<T> = T & Record<string, unknown>

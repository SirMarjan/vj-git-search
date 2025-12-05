import type { AxiosResponse } from 'axios'
import { ref, type Ref } from 'vue'
import type { PageableParams } from '@/services/web/gitlabService'
import type { LoadingStatus } from '@/types/types'

export function useGetAllPages<T>(
  pageableRequestFn: (params: PageableParams) => Promise<AxiosResponse<T[]>>,
): {
  results: Ref<T[]>
  state: Ref<LoadingStatus>
  fetchAllPages: () => Promise<void>
} {
  const results = ref<T[]>([])
  const state = ref<LoadingStatus>('IDLE')

  const fetchAllPages = async (): Promise<void> => {
    state.value = 'LOADING'
    results.value = []

    try {
      const data: T[] = []
      let page = 1
      let hasMorePages = true

      while (hasMorePages) {
        const response = await pageableRequestFn({ page, per_page: 100 })
        data.push(...response.data)

        const totalPages = response.headers['x-total-pages'] as string | undefined
        hasMorePages =
          totalPages != null && totalPages !== '' ? page < parseInt(totalPages, 10) : false
        page++
      }

      results.value = data
      state.value = 'IDLE'
    } catch (err) {
      state.value = 'ERROR'
      console.error('Error in fetchAllPages:', err)
    }
  }

  return {
    results: results as Ref<T[]>,
    state,
    fetchAllPages,
  }
}

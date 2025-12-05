import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { BlobSearchResult, Group, Project } from '@/types/types'
import { gitlabService } from '@/services/web/gitlabService'
import { useServerDataStore } from '@/stores/serverData'
import { useGetAllPages } from '@/composables/useGetAllPages'
import { collapseGroups, getProjectsInGroups } from '@/services/gitlabModelsTransformers'

export type LoadingStatus = 'IDLE' | 'ERROR' | 'PRELOAD_PROJECTS' | 'LOADING'

export const useSearchStore = defineStore('search', () => {
  const searchResult = ref<BlobSearchResult[]>([])
  const loadingStatus = ref<LoadingStatus>('IDLE')
  const totalProjectsToSearch = ref<number>(0)
  const projectsSearched = ref<number>(0)
  const lastSearchParams = ref<{
    selectedGroups: Group[]
    filenameFilter: string
    searchFilter: string
  }>()

  const serverDataStore = useServerDataStore()

  async function search(
    selectedGroups: Group[],
    searchInAllProjects: boolean,
    selectedProjects: Project[],
    filenameFilter: string,
    searchFilter: string,
  ): Promise<void> {
    loadingStatus.value = 'PRELOAD_PROJECTS'
    lastSearchParams.value = {
      selectedGroups,
      filenameFilter,
      searchFilter,
    }
    totalProjectsToSearch.value = 0
    projectsSearched.value = 0

    const projects: Project[] = []

    if (searchInAllProjects) {
      const collapsedGroups = collapseGroups(selectedGroups)

      for (const group of collapsedGroups) {
        await serverDataStore.loadGroupProjects(group.id)
      }

      projects.push(...getProjectsInGroups(collapsedGroups, serverDataStore.projects))
    } else {
      projects.push(...selectedProjects)
    }

    loadingStatus.value = 'LOADING'
    totalProjectsToSearch.value = projects.length

    const results: BlobSearchResult[] = []

    for (const project of projects) {
      try {
        const projectLoader = useGetAllPages((params) =>
          gitlabService.searchBlobInProjects({
            ...params,
            projectId: project.id.toString(),
            filename: filenameFilter,
            search: searchFilter,
          }),
        )
        await projectLoader.fetchAllPages()
        console.info(projectLoader.results.value)
        results.push(...projectLoader.results.value)

        projectsSearched.value++
      } catch (err) {
        loadingStatus.value = 'ERROR'
        console.error('Error in fetchAllPages:', err)
      }
    }

    searchResult.value = results
    loadingStatus.value = 'IDLE'
  }

  return {
    searchResult,
    loadingStatus,
    totalProjectsToSearch,
    projectsSearched,
    lastSearchParams,
    search,
  }
})

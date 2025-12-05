import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Group, Project } from '@/types/types'
import { gitlabService } from '@/services/web/gitlabService'
import { useGetAllPages } from '@/composables/useGetAllPages'
import { collapseGroups } from '@/services/gitlabModelsTransformers'

export const useServerDataStore = defineStore('serverData', () => {
  const groups = ref<Group[]>([])
  const projects = ref<Project[]>([])

  const loadedProjectsGroupsIds: string[] = []

  const groupsLoader = useGetAllPages(gitlabService.getGroups)

  async function loadGroups(): Promise<void> {
    try {
      await groupsLoader.fetchAllPages()

      groups.value = groupsLoader.results.value
    } catch (error) {
      console.error('Failed to refresh server data:', error)
    }
  }

  async function loadGroupProjects(groupId: string): Promise<void> {
    if (loadedProjectsGroupsIds.find((it) => it === groupId) != null) {
      return
    }

    const projectGroupLoader = useGetAllPages((params) =>
      gitlabService.getGroupsProjects(groupId, params),
    )
    try {
      await projectGroupLoader.fetchAllPages()
      loadedProjectsGroupsIds.push(groupId)

      projects.value = deduplicateProjects([...projects.value, ...projectGroupLoader.results.value])
    } catch (error) {
      console.error('Failed to refresh server data:', error)
    }
  }

  async function loadGroupsProjects(groupsIds: string[]): Promise<void> {
    const groupsIdsSet = new Set(groupsIds)
    const groupsToLoad = collapseGroups(groups.value.filter((it) => groupsIdsSet.has(it.id)))

    for (const group of groupsToLoad) {
      await loadGroupProjects(group.id)
    }
  }

  function clearStore(): void {
    groups.value = []
    projects.value = []
    loadedProjectsGroupsIds.length = 0
  }

  return {
    groups,
    projects,
    clearStore,
    loadGroups,
    loadGroupProjects,
    loadGroupsProjects,
  }
})

function deduplicateProjects(projects: Project[]): Project[] {
  const projectsIds = new Set<number>()
  const projectsAcc: Project[] = []
  for (const project of projects) {
    if (!projectsIds.has(project.id)) {
      projectsAcc.push(project)
      projectsIds.add(project.id)
    }
  }
  return projectsAcc
}

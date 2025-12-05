<script lang="ts" setup>
import type { TreeNode } from 'primevue/treenode'
import { computed } from 'vue'
import { useDialog } from 'primevue'
import type { CodeDisplayInput } from './CodeDisplay.vue'
import CodeDisplay from './CodeDisplay.vue'
import { useSearchStore } from '@/stores/search'
import { useServerDataStore } from '@/stores/serverData'
import type { BlobSearchResult, Project } from '@/types/types'
import { notNullish } from '@/commons/notNullish'

type ProjectId = number
type FilePath = string

const searchStore = useSearchStore()
const serverData = useServerDataStore()
const dialog = useDialog()

const nodes = computed(() => {
  const searchResult = searchStore.searchResult
  const projects = serverData.projects

  const groupByProjectAndFile = groupSearchResults(searchResult)
  const treeNodes = buildTreeNodes(groupByProjectAndFile, projects)

  return treeNodes
})

const progressValue = computed(() => {
  if (searchStore.totalProjectsToSearch === 0) {
    return 0
  }
  return (searchStore.projectsSearched / searchStore.totalProjectsToSearch) * 100
})

const progressMessage = computed(() => {
  return `${searchStore.projectsSearched.toFixed()} / ${searchStore.totalProjectsToSearch.toFixed()}`
})

function groupSearchResults(
  searchResults: BlobSearchResult[],
): Map<ProjectId, Map<FilePath, BlobSearchResult[]>> {
  const grouped = new Map<ProjectId, Map<FilePath, BlobSearchResult[]>>()

  for (const result of searchResults) {
    if (!grouped.has(result.project_id)) {
      grouped.set(result.project_id, new Map())
    }

    const projectFiles = notNullish(grouped.get(result.project_id))

    if (!projectFiles.has(result.path)) {
      projectFiles.set(result.path, [])
    }

    notNullish(projectFiles.get(result.path)).push(result)
  }

  return grouped
}

function showFile(searchResults: BlobSearchResult[], projects: Project[]): void {
  const searchResult = searchResults[0]
  const project = notNullish(projects.find((it) => it.id === searchResult.project_id))
  const filePath = searchResult.path
  const data: CodeDisplayInput = {
    project,
    filePath,
    searchText: searchStore.lastSearchParams?.searchFilter,
  }
  dialog.open(CodeDisplay, {
    data,
    props: {
      header: filePath,
    },
  })
}

function buildTreeNodes(
  groupedResults: Map<ProjectId, Map<FilePath, BlobSearchResult[]>>,
  projects: Project[],
): TreeNode[] {
  const treeNodes: TreeNode[] = []

  for (const [projectId, files] of groupedResults) {
    const project = projects.find((p) => p.id === projectId)

    if (project != null) {
      const projectNode: TreeNode & { children: TreeNode[] } = {
        key: projectId.toString(),
        label: project.path_with_namespace,
        leaf: false,
        icon: 'pi pi-folder',
        children: [],
      }

      for (const [filePath, searchResults] of files) {
        projectNode.children.push({
          key: `${projectId.toFixed()}-${filePath}`,
          label: filePath,
          type: 'file',
          leaf: true,
          data: searchResults,
          icon: 'pi pi-file',
        })
      }

      treeNodes.push(projectNode)
    }
  }

  return treeNodes
}
</script>

<template>
  <PvProgressBar
    :mode="searchStore.loadingStatus === 'PRELOAD_PROJECTS' ? 'indeterminate' : 'determinate'"
    :value="progressValue"
  >
    {{ progressMessage }}
  </PvProgressBar>
  <PvTree :value="nodes">
    <template #file="slotProps">
      <span class="file-label" @click="showFile(slotProps.node.data, serverData.projects)">
        {{ slotProps.node.label }}
      </span>
    </template>
  </PvTree>
</template>

<style lang="scss" scoped>
.file-label {
  cursor: pointer;
}
</style>

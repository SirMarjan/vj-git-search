<script lang="ts" setup>
import type { TreeNode } from 'primevue/treenode'
import { computed, ref } from 'vue'
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

const expandedKeys = ref<Record<string, boolean>>({})

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

function showFile(searchResults: BlobSearchResult[]): void {
  const projects = serverData.projects
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
      modal: true,
      style: {
        width: '90vw',
      },
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
        children: [],
      }

      for (const [filePath, searchResults] of files) {
        projectNode.children.push({
          key: `${projectId.toFixed()}-${filePath}`,
          label: filePath,
          type: 'file',
          leaf: true,
          data: searchResults,
        })
      }

      treeNodes.push(projectNode)
    }
  }

  return treeNodes
}

const expandAll = (): void => {
  for (const node of nodes.value) {
    expandNodeAndChilderns(node)
  }

  expandedKeys.value = { ...expandedKeys.value }
}

const collapseAll = (): void => {
  expandedKeys.value = {}
}

const expandNodeAndChilderns = (node: TreeNode): void => {
  if (node.children != null && node.children.length !== 0) {
    expandedKeys.value[node.key] = true

    for (const child of node.children) {
      expandNodeAndChilderns(child)
    }
  }
}

const expandOrCollapseNode = (node: TreeNode): void => {
  expandedKeys.value[node.key] = !expandedKeys.value[node.key]
  expandedKeys.value = { ...expandedKeys.value }
}
</script>

<template>
  <PvProgressBar
    :mode="searchStore.loadingStatus === 'PRELOAD_PROJECTS' ? 'indeterminate' : 'determinate'"
    :value="progressValue"
  >
    {{ progressMessage }}
  </PvProgressBar>
  <div v-if="nodes.length > 0">
    <div class="button-group">
      <PvButton
        type="button"
        icon="pi pi-plus"
        label="Expand All"
        size="small"
        @click="expandAll"
      />
      <PvButton
        type="button"
        icon="pi pi-minus"
        label="Collapse All"
        size="small"
        @click="collapseAll"
      />
    </div>
    <PvTree :value="nodes" :expanded-keys="expandedKeys">
      <template #default="slotProps">
        <div>
          <div class="row-group" @click="expandOrCollapseNode(slotProps.node)">
            <i class="pi pi-folder"></i>
            <span class="file-label">
              {{ slotProps.node.label }}
            </span>
            <PvOverlayBadge value="2" size="small">
              <i class="pi pi-file rotate-x"></i>
            </PvOverlayBadge>
            <PvOverlayBadge value="2" size="small">
              <i class="pi pi-search"></i>
            </PvOverlayBadge>
          </div>
        </div>
      </template>
      <template #file="slotProps">
        <div class="row-group" @click="showFile(slotProps.node.data)">
          <span class="file-label">
            {{ slotProps.node.label }}
          </span>
          <PvOverlayBadge value="2" size="small">
            <i class="pi pi-search"></i>
          </PvOverlayBadge>
        </div>
      </template>
    </PvTree>
  </div>
</template>

<style lang="scss" scoped>
.button-group {
  display: flex;
  gap: 8px;
}

.file-label {
  cursor: pointer;
}

.row-group {
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 4px;
  cursor: pointer;

  i.pi {
    font-size: 1.3rem;
  }
}

.rotate-x {
  transform: scaleX(-1);
}
</style>

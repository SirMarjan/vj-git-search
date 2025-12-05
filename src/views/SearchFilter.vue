<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useSearchStore } from '@/stores/search'
import { useServerDataStore } from '@/stores/serverData'
import type { Group, Project } from '@/types/types'
import type { FormSubmitEvent } from '@primevue/forms/form'
import { useCacheTransformedValue } from '@/composables/useCachedValue'
import { collapseGroups, isGroupsProject } from '@/services/gitlabModelsTransformers'
import { computeShortName } from '@/commons/shortName'

interface Form {
  selectedGroups: Group[]
  selectedProjects: Project[]
  searchInAllProjects: boolean
  fileNameFilter: string
  textFilter: string
}

const selectedGroups = ref<Group[]>([])
const searchInAllProjects = ref<boolean>(true)
const groupsProjectsLoad = ref<boolean>(false)

const serverDataStore = useServerDataStore()
const searchStore = useSearchStore()

const initialValues = ref<Form>({
  selectedGroups: [],
  selectedProjects: [],
  searchInAllProjects: true,
  fileNameFilter: '',
  textFilter: '',
})

const groupsToSelect = computed(() => {
  return serverDataStore.groups
    .slice()
    .sort((a: { full_name: string }, b: { full_name: string }) =>
      a.full_name.localeCompare(b.full_name),
    )
})

const collapsedSelectedGroups = computed(() => {
  const groupsValue = selectedGroups.value
  return collapseGroups(groupsValue)
})

const projectsToSelect = computed(() => {
  const collapsedSelectedGroupsValue = collapsedSelectedGroups.value
  return serverDataStore.projects.filter((it) => isGroupsProject(collapsedSelectedGroupsValue, it))
})

const onSelectedGroupsChange = (groups?: Group[]): void => {
  selectedGroups.value = groups ?? []
}

const onSearchInAllProjectsChange = (value: boolean): void => {
  searchInAllProjects.value = value
}

const onFormSubmit = (e: FormSubmitEvent): void => {
  if (e.valid) {
    const values = e.values as Form
    void searchStore.search(
      values.selectedGroups,
      values.searchInAllProjects,
      values.selectedProjects,
      values.fileNameFilter,
      values.textFilter,
    )
  }
}

const cachedGroupsShortName = useCacheTransformedValue((group: Group) =>
  computeShortName(group.full_name),
)
const cachedProjectsShortName = useCacheTransformedValue((project: Project) =>
  computeShortName(project.path_with_namespace),
)

watch(groupsToSelect, () => {
  cachedGroupsShortName.clear()
})

watch(projectsToSelect, () => {
  cachedProjectsShortName.clear()
})

watch(collapsedSelectedGroups, async () => {
  groupsProjectsLoad.value = true
  await serverDataStore.loadGroupsProjects(collapsedSelectedGroups.value.map((it) => it.id))
  groupsProjectsLoad.value = false
})

onMounted(async () => {
  await serverDataStore.loadGroups()
})
</script>

<template>
  <PvForm :initial-values="initialValues" @submit="onFormSubmit">
    <div class="filter-group">
      <div class="filter-row">
        <PvFloatLabel variant="on" class="filter-text">
          <PvMultiSelect
            id="groups-filter"
            name="selectedGroups"
            class="filter-text"
            filter
            show-toggle-all
            display="chip"
            :max-selected-labels="3"
            :virtual-scroller-options="{ itemSize: 30 }"
            :loading="serverDataStore.groups.length === 0"
            :options="groupsToSelect"
            option-label="full_name"
            @update:model-value="onSelectedGroupsChange"
          >
            <template #chip="slotProps">
              <PvChip
                :label="cachedGroupsShortName.getValue(slotProps.value)"
                removable
                @remove="(event) => slotProps.removeCallback(event, slotProps.value)"
              />
            </template>
          </PvMultiSelect>
          <label for="groups-filter">Groups</label>
        </PvFloatLabel>
      </div>
      <div class="filter-row">
        <div class="filter-toggle">
          <PvToggleSwitch
            id="search-in-all-projects-filter"
            name="searchInAllProjects"
            @update:model-value="onSearchInAllProjectsChange"
          />
          <label for="search-in-all-projects-filter">All projects</label>
        </div>
        <PvFloatLabel variant="on" class="filter-text">
          <PvMultiSelect
            id="projects-filter"
            name="selectedProjects"
            class="filter-text"
            filter
            show-toggle-all
            display="chip"
            :disabled="searchInAllProjects"
            :max-selected-labels="3"
            :virtual-scroller-options="{ itemSize: 30 }"
            :loading="groupsProjectsLoad"
            :options="projectsToSelect"
            option-label="path_with_namespace"
          >
            <template #chip="slotProps">
              <PvChip
                :label="cachedProjectsShortName.getValue(slotProps.value)"
                removable
                @remove="(event) => slotProps.removeCallback(event, slotProps.value)"
              />
            </template>
          </PvMultiSelect>
          <label for="projects-filter">Projects</label>
        </PvFloatLabel>
      </div>
      <div class="filter-row">
        <PvFloatLabel variant="on" class="filter-text">
          <PvInputText id="filename-filter" name="fileNameFilter" class="filter-text" type="text" />
          <label for="filename-filter">File name</label>
        </PvFloatLabel>
        <PvFloatLabel variant="on" class="filter-text">
          <PvInputText id="text-filter" name="textFilter" class="filter-text" type="text" />
          <label for="text-filter">Text</label>
        </PvFloatLabel>
        <PvButton
          class="filter-button"
          label="Search"
          type="submit"
          icon="pi pi-search"
          icon-pos="left"
        />
      </div>
      <div class="filter-row"></div>
    </div>
  </PvForm>
</template>

<style lang="scss" scoped>
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-row {
  display: flex;
  flex-direction: row;
  gap: 8px;

  .filter-text {
    flex: 1;
    width: 100%;
  }

  .filter-button {
    flex: 0 0 auto;
    min-width: fit-content;
  }

  .filter-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex: 0 0 auto;
    min-width: fit-content;
  }
}
</style>

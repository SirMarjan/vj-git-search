<script lang="ts" setup>
import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
import { computed, inject, onMounted, ref, type Ref } from 'vue'
import CodeHighlight from '@/views/code-highlight/CodeHighlight.vue'
import { gitlabService } from '@/services/web/gitlabService'
import type { Project } from '@/types/types'

export interface CodeDisplayInput {
  filePath: string
  project: Project
  searchText?: string
}

const dialogRef = inject<Ref<DynamicDialogInstance>>('dialogRef')

const code = ref<string>()

const centerLineIdx = ref<number>(0)

const data = computed<CodeDisplayInput>(() => dialogRef?.value.data as CodeDisplayInput)

const linesWithSearchText = computed(() => {
  const codeValue = code.value
  const searchTextValue = data.value.searchText?.toLowerCase()

  if (codeValue == null || searchTextValue == null) {
    return undefined
  }

  const linesWithText = codeValue
    .toLowerCase()
    .split('\n')
    .reduce<number[]>((acc, line, idx) => {
      if (line.includes(searchTextValue)) {
        acc.push(idx)
      }

      return acc
    }, [])
  return linesWithText
})

const centerLine = computed(() => {
  if (linesWithSearchText.value == null) {
    return undefined
  }

  return linesWithSearchText.value[centerLineIdx.value]
})

const buttonsHelpText = computed(() => {
  const linesWithSearchTextLenght = linesWithSearchText.value?.length
  if (linesWithSearchTextLenght == null) {
    return
  }
  return `Line ${((centerLine.value ?? 0) + 1).toString()} : ${(centerLineIdx.value + 1).toString()} of ${linesWithSearchTextLenght.toString()}`
})

onMounted(async () => {
  try {
    const response = await gitlabService.getFile(data.value.project.id, data.value.filePath)
    code.value = atob(response.data.content)
  } catch (error) {
    console.error('Failed to fetch file content:', error)
  }
})

function increase(): void {
  const linesWithSearchTextLenght = linesWithSearchText.value?.length
  if (linesWithSearchTextLenght == null || linesWithSearchTextLenght === 0) {
    return
  }
  centerLineIdx.value = (centerLineIdx.value + 1) % linesWithSearchTextLenght
}

function decrease(): void {
  const linesWithSearchTextLenght = linesWithSearchText.value?.length
  if (linesWithSearchTextLenght == null || linesWithSearchTextLenght === 0) {
    return
  }
  centerLineIdx.value =
    (centerLineIdx.value - 1 + linesWithSearchTextLenght) % linesWithSearchTextLenght
}
</script>

<template>
  <div class="code-display">
    <div v-if="buttonsHelpText != null" class="nav-header">
      <PvButtonGroup>
        <PvButton aria-label="Previous" icon="pi pi-arrow-left" size="small" @click="decrease" />
        <PvButton aria-label="Next" icon="pi pi-arrow-right" size="small" @click="increase" />
      </PvButtonGroup>
      <span>{{ buttonsHelpText }}</span>
    </div>
    <CodeHighlight
      v-if="code != undefined"
      :code="code ?? ''"
      :file-path="data.filePath ?? ''"
      :highlight-lines="linesWithSearchText ?? []"
      :center-line="centerLine"
      :highlight-text="data.searchText"
    />
    <PvProgressSpinner v-else />
  </div>
</template>

<style lang="scss" scoped>
.nav-header {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}
.code-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

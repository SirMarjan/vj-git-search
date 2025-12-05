<script setup lang="ts">
import { EditorView } from '@codemirror/view'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { getSyntaxFromPath, createReadOnlyEditorView } from './readOnlyEditorViewFactory'
import { arraysEqual } from '@/commons/compare'

const props = defineProps<{
  code: string
  filePath: string
  highlightLines: number[]
  highlightText?: string
  centerLine?: number
}>()

const codeHighlightRef = useTemplateRef('codeHighlightRef')

const editorView = ref<EditorView | undefined>(undefined)

const syntax = computed(() => {
  return getSyntaxFromPath(props.filePath)
})

watch(
  () => {
    return {
      code: props.code,
      filePath: props.filePath,
      highlightLines: props.highlightLines,
      highlightText: props.highlightText,
    }
  },
  (newValues, oldValues) => {
    if (
      oldValues.code === newValues.code &&
      oldValues.filePath === newValues.filePath &&
      oldValues.highlightText === newValues.highlightText &&
      arraysEqual(oldValues.highlightLines, newValues.highlightLines)
    ) {
      return
    }

    if (editorView.value == null || codeHighlightRef.value == null) {
      return
    }

    editorView.value.destroy()
    const editorViewEl = createReadOnlyEditorView(
      newValues.code,
      syntax.value,
      newValues.highlightLines,
      newValues.highlightText,
    )
    editorView.value = editorViewEl
    codeHighlightRef.value.append(editorViewEl.dom)
  },
)

watch(
  () => props.centerLine,
  (newCenterLine) => {
    if (editorView.value == null || codeHighlightRef.value == null || newCenterLine == null) {
      return
    }

    const line = editorView.value.state.doc.line(newCenterLine + 1)
    editorView.value.dispatch({
      effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
    })
  },
)

onMounted(() => {
  const editroViewEl = createReadOnlyEditorView(
    props.code,
    syntax.value,
    props.highlightLines,
    props.highlightText,
  )
  editorView.value = editroViewEl
  codeHighlightRef.value?.append(editroViewEl.dom)
})

onUnmounted(() => {
  editorView.value?.destroy()
})
</script>

<template>
  <div ref="codeHighlightRef" class="code-highlight" />
</template>

<style lang="scss" scoped>
.code-highlight {
  overflow: auto;
  max-height: 50vh;

  :deep(.highlight-line) {
    background-color: rgba(44, 92, 48, 0.2);
  }
  :deep(.highlight-text) {
    background-color: rgba(226, 225, 255, 0.2);
  }
}
</style>

<script setup lang="ts">
import { useDialog } from 'primevue'
import GitlabApiOptions from './GitlabApiOptions.vue'

const dialog = useDialog()

const onClick = (): void => {
  dialog.open(GitlabApiOptions, {
    props: {
      header: 'Gitlab Api options',
      closable: false,
      modal: true,
      style: {
        width: '50vw',
      },
    },
  })
}
</script>

<template>
  <header>
    <PvButton @click="onClick">Options</PvButton>
  </header>
</template>

<style scoped lang="scss">
header {
  display: flex;
  justify-content: end;
  gap: 8px;

  button {
    flex: 0 0 auto;
  }
}
</style>

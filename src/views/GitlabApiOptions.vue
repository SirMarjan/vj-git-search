<script setup lang="ts">
import { useServerCredentialsStore } from '@/stores/serverCredentials'
import type { FormSubmitEvent } from '@primevue/forms/form'
import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
import { inject, ref, type Ref } from 'vue'

const serverCredentialsStore = useServerCredentialsStore()
const dialogRef = inject<Ref<DynamicDialogInstance>>('dialogRef')

interface GitlabApiOptionsForm {
  url: string
  token: string
}

const initialValues = ref<GitlabApiOptionsForm>({
  url: serverCredentialsStore.url,
  token: serverCredentialsStore.token,
})

const handleSave = (e: FormSubmitEvent): void => {
  if (e.valid) {
    const values = e.values as GitlabApiOptionsForm
    serverCredentialsStore.updateCredentials(values.url, values.token)
    dialogRef?.value.close()
  }
}

const handleCancel = (): void => {
  dialogRef?.value.close()
}
</script>

<template>
  <div>
    <PvForm :initial-values="initialValues" class="container" @submit="handleSave">
      <PvFloatLabel variant="on">
        <PvInputText id="gitlab-api-url" type="text" name="url" class="input" />
        <label for="gitlab-api-url">Gitlab API URL</label>
      </PvFloatLabel>
      <PvFloatLabel variant="on">
        <PvInputText id="gitlab-api-token" type="text" name="token" class="input" />
        <label for="gitlab-api-token">Gitlab API token</label>
      </PvFloatLabel>
      <div class="button-group">
        <PvButton label="Cancel" severity="secondary" type="button" @click="handleCancel" />
        <PvButton label="Save" type="submit" />
      </div>
    </PvForm>
  </div>
</template>

<style lang="scss" scoped>
.container {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.input {
  width: 100%;
}
</style>

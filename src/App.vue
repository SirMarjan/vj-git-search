<script setup lang="ts">
import AppHeader from './views/AppHeader.vue'
import SearchFilter from './views/SearchFilter.vue'
import SearchResultTable from './views/SearchResultTable.vue'
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <SearchFilter />
    <SearchResultTable />
    <PvDynamicDialog />
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

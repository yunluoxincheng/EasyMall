<script setup lang="ts">
import { NConfigProvider, NDialogProvider, NMessageProvider } from 'naive-ui'
</script>

<template>
  <NConfigProvider>
    <NDialogProvider>
      <NMessageProvider>
        <router-view />
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { ToastProvider } from 'reka-ui'
</script>

<template>
  <ToastProvider swipe-direction="right">
    <main class="px-4 py-10 text-center">
      <RouterView />
      <TheFooter class="mt-6" />
    </main>

    <ToastContainer />
  </ToastProvider>
</template>

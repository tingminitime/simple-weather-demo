<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div class="text-red-400">
    <p class="mb-4">
      <em>Page Not Found.</em>
    </p>
    <button
      type="button"
      class="my-btn mx-auto"
      @click="router.push('/')"
    >
      Back
    </button>
  </div>
</template>

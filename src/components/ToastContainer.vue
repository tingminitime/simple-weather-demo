<script setup lang="ts">
import {
  ToastClose,
  ToastDescription,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from 'reka-ui'

defineOptions({
  name: 'ToastContainer',
})

const { toasts, removeToast } = useToast()
</script>

<template>
  <ToastViewport
    class="
      pointer-events-none fixed right-0 bottom-0 z-50 flex max-w-md flex-col
      gap-2 p-4
    "
  >
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      class="
        data-[state=open]:animate-in
        data-[state=closed]:animate-out data-[state=closed]:fade-out-80
        data-[state=open]:slide-in-from-right
        data-[state=closed]:slide-out-to-right
        pointer-events-auto rounded-lg border bg-white p-4 shadow-lg
        dark:bg-stone-800
      "
      :class="{
        'border-green-500': toast.type === 'success',
        'border-red-500': toast.type === 'error',
      }"
      :duration="3000"
      @update:open="(open: boolean) => !open && removeToast(toast.id)"
    >
      <div class="flex items-start gap-3">
        <!-- Icon based on type -->
        <span
          class="shrink-0 text-xl"
          :class="{
            'icon-[carbon--checkmark-filled]': toast.type === 'success',
            'icon-[carbon--close-filled]': toast.type === 'error',
            'text-green-500': toast.type === 'success',
            'text-red-500': toast.type === 'error',
          }"
        ></span>

        <div class="flex-1">
          <ToastTitle class="text-sm font-medium">
            {{ toast.title }}
          </ToastTitle>
          <ToastDescription class="text-sm opacity-80">
            <!-- Optional description can be added later if needed -->
          </ToastDescription>
        </div>

        <ToastClose
          class="
            shrink-0 rounded-md p-1 opacity-70 transition-opacity
            hover:opacity-100
          "
          aria-label="關閉"
        >
          <span class="icon-[carbon--close] size-4"></span>
        </ToastClose>
      </div>
    </ToastRoot>
  </ToastViewport>
</template>

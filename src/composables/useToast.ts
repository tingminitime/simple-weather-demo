interface Toast {
  id: string
  title: string
  type: 'success' | 'error'
}

const toasts = ref<Toast[]>([])

export function useToast() {
  /**
   * Show a toast notification
   * @param title - Toast message
   * @param type - Toast type (success or error)
   * @param duration - Auto-dismiss duration in milliseconds (0 for manual dismissal)
   */
  function showToast(
    title: string,
    type: 'success' | 'error' = 'success',
    duration = 3000,
  ): void {
    const id = `toast-${Date.now()}-${Math.random()}`

    // Limit to 5 toasts maximum to prevent memory issues
    if (toasts.value.length >= 5) {
      toasts.value.shift()
    }

    toasts.value.push({
      id,
      title,
      type,
    })

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  /**
   * Remove a specific toast by ID
   * @param id - Toast ID to remove
   */
  function removeToast(id: string): void {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts: readonly(toasts), // Prevent external mutation
    showToast,
    removeToast,
  }
}

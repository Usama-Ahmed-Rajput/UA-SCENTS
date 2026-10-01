export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export function useToast() {
  const toasts = useState<ToastItem[]>('admin-toasts-list', () => [])

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3500) {
    const id = Math.random().toString(36).substring(2, 9)
    toasts.value.push({ id, message, type })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    showToast,
    removeToast,
    success: (msg: string, duration?: number) => showToast(msg, 'success', duration),
    error: (msg: string, duration?: number) => showToast(msg, 'error', duration),
    info: (msg: string, duration?: number) => showToast(msg, 'info', duration)
  }
}

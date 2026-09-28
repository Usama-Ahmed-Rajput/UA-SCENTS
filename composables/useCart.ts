import type { Product, ProductVariant } from './useProducts'

export interface CartLine {
  key: string
  handle: string
  title: string
  image: string
  variant: ProductVariant
  quantity: number
}

export function useCart() {
  const lines = useState<CartLine[]>('cart-lines', () => [])
  const drawerOpen = useState<boolean>('cart-drawer-open', () => false)

  const count = computed(() =>
    lines.value.reduce((sum, l) => sum + l.quantity, 0)
  )

  const subtotal = computed(() =>
    lines.value.reduce((sum, l) => sum + l.quantity * l.variant.price, 0)
  )

  function addItem(product: Product, variant: ProductVariant, quantity = 1) {
    const key = `${product.handle}-${variant.id}`
    const existing = lines.value.find((l) => l.key === key)
    if (existing) {
      existing.quantity += quantity
    } else {
      lines.value.push({
        key,
        handle: product.handle,
        title: product.title,
        image: product.image,
        variant,
        quantity
      })
    }
    drawerOpen.value = true
  }

  function updateQuantity(key: string, quantity: number) {
    const line = lines.value.find((l) => l.key === key)
    if (!line) return
    if (quantity <= 0) {
      removeItem(key)
      return
    }
    line.quantity = quantity
  }

  function removeItem(key: string) {
    lines.value = lines.value.filter((l) => l.key !== key)
  }

  function clearCart() {
    lines.value = []
  }

  return { lines, count, subtotal, drawerOpen, addItem, updateQuantity, removeItem, clearCart }
}

export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined || price === '') return 'Rs: 0'
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return 'Rs: 0'
  return `Rs: ${num.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

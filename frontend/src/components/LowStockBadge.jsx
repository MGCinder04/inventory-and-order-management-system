import { AlertTriangle } from 'lucide-react'

export function LowStockBadge({ quantity, threshold }) {
  if (quantity > threshold) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
      <AlertTriangle size={10} />
      Low stock
    </span>
  )
}

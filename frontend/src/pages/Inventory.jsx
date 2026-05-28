import { useEffect, useState, useCallback } from 'react'
import { Warehouse } from 'lucide-react'
import { inventoryApi } from '../api/inventory'
import { LowStockBadge } from '../components/LowStockBadge'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/formatters'

const LOW_STOCK_THRESHOLD = parseInt(import.meta.env.VITE_LOW_STOCK_THRESHOLD || '10', 10)

export default function Inventory() {
  const { addToast } = useToast()
  const [inventory, setInventory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [adjustingProduct, setAdjustingProduct] = useState(null)
  const [adjustForm, setAdjustForm] = useState({ quantity_change: '', reason: '' })
  const [isSaving, setIsSaving] = useState(false)

  const loadInventory = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await inventoryApi.list()
      setInventory(response.data)
    } catch {
      addToast('Failed to load inventory', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  useEffect(() => { loadInventory() }, [loadInventory])

  function openAdjustModal(product) {
    setAdjustingProduct(product)
    setAdjustForm({ quantity_change: '', reason: '' })
  }

  function closeAdjustModal() {
    setAdjustingProduct(null)
    setAdjustForm({ quantity_change: '', reason: '' })
  }

  async function handleAdjust(e) {
    e.preventDefault()
    setIsSaving(true)
    try {
      await inventoryApi.adjust(adjustingProduct.id, {
        quantity_change: parseInt(adjustForm.quantity_change, 10),
        reason: adjustForm.reason.trim(),
      })
      addToast('Stock adjusted successfully')
      closeAdjustModal()
      loadInventory()
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to adjust stock', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>

      {isLoading ? (
        <EmptyState title="Loading inventory…" />
      ) : inventory.length === 0 ? (
        <EmptyState
          icon={Warehouse}
          title="No products in inventory"
          description="Add products first to track their stock here."
        />
      ) : (
        <div className="space-y-3">
          {inventory.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{product.name}</span>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {product.sku}
                    </span>
                    <LowStockBadge quantity={product.quantity_in_stock} threshold={LOW_STOCK_THRESHOLD} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      In stock:{' '}
                      <span className={`font-bold ${
                        product.quantity_in_stock <= LOW_STOCK_THRESHOLD
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {product.quantity_in_stock}
                      </span>
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span>{formatCurrency(product.price)} per unit</span>
                  </div>
                </div>
                <button
                  onClick={() => openAdjustModal(product)}
                  className="shrink-0 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors font-medium"
                >
                  Adjust Stock
                </button>
              </div>

              {product.recent_logs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Recent activity
                  </p>
                  <div className="space-y-1.5">
                    {product.recent_logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400 truncate mr-4">{log.reason}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`font-semibold tabular-nums ${
                            log.quantity_change >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {log.quantity_change >= 0 ? '+' : ''}{log.quantity_change}
                          </span>
                          <span className="text-gray-400">
                            {new Date(log.created_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {adjustingProduct && (
        <div className="modal-overlay">
          <div className="modal-content bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Adjust Stock</h2>
              <button
                onClick={closeAdjustModal}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAdjust} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {adjustingProduct.name}
                </span>
                <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                  Current stock:{' '}
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {adjustingProduct.quantity_in_stock}
                  </span>{' '}
                  units
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Quantity Change{' '}
                  <span className="text-gray-400 font-normal">(use negative to remove)</span>
                </label>
                <input
                  required
                  type="number"
                  value={adjustForm.quantity_change}
                  onChange={(e) => setAdjustForm((f) => ({ ...f, quantity_change: e.target.value }))}
                  placeholder="e.g. 50 or -10"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Reason <span className="text-red-500">*</span></label>
                <input
                  required
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder="e.g. Restocking shipment received"
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={closeAdjustModal} className={secondaryButtonClass}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="button">
                  {isSaving ? 'Saving…' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400'
const secondaryButtonClass =
  'px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium transition-colors'

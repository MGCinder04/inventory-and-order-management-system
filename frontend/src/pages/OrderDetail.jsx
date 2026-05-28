import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { ordersApi } from '../api/orders'
import { useToast } from '../hooks/useToast'

const STATUS_SEQUENCE = ['pending', 'confirmed', 'shipped', 'delivered']

const STATUS_BADGE_CLASSES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  shipped: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const VALID_NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null,
}

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      try {
        const response = await ordersApi.getById(orderId)
        setOrder(response.data)
      } catch {
        addToast('Failed to load order', 'error')
      } finally {
        setIsLoading(false)
      }
    }
    loadOrder()
  }, [orderId, addToast])

  async function advanceStatus() {
    const nextStatus = VALID_NEXT_STATUS[order.status]
    if (!nextStatus) return
    setIsUpdating(true)
    try {
      const response = await ordersApi.updateStatus(order.id, nextStatus)
      setOrder(response.data)
      addToast(`Order marked as ${nextStatus}`)
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to update status', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  async function cancelOrder() {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return
    setIsUpdating(true)
    try {
      const response = await ordersApi.updateStatus(order.id, 'cancelled')
      setOrder(response.data)
      addToast('Order cancelled — stock restored')
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to cancel order', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
  }

  if (!order) {
    return <div className="p-6 text-gray-500">Order not found.</div>
  }

  const nextStatus = VALID_NEXT_STATUS[order.status]
  const isCancellable = order.status !== 'cancelled' && order.status !== 'delivered'
  const currentStepIndex = STATUS_SEQUENCE.indexOf(order.status)

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/orders')}
          className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE_CLASSES[order.status] ?? ''}`}>
          {order.status}
        </span>
      </div>

      {order.status !== 'cancelled' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-sm">Progress</h2>
          <div className="flex items-center gap-1">
            {STATUS_SEQUENCE.map((step, index) => (
              <div key={step} className="flex items-center gap-1 flex-1">
                <div className={`flex-1 text-center`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-1
                    ${index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                    {index + 1}
                  </div>
                  <span className={`text-xs capitalize ${index <= currentStepIndex ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
                {index < STATUS_SEQUENCE.length - 1 && (
                  <ChevronRight size={14} className={`text-gray-300 dark:text-gray-600 mb-5 shrink-0`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">Customer</h2>
        <p className="text-gray-700 dark:text-gray-300">{order.customer?.full_name}</p>
        <p className="text-sm text-gray-400">{order.customer?.email}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">Product</th>
              <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">Unit Price</th>
              <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">Qty</th>
              <th className="text-right py-2 font-medium text-gray-500 dark:text-gray-400">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 text-gray-900 dark:text-gray-100">
                  {item.product?.name ?? `Product #${item.product_id}`}
                  <span className="text-xs text-gray-400 ml-1 font-mono">{item.product?.sku}</span>
                </td>
                <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                  ${Number(item.unit_price).toFixed(2)}
                </td>
                <td className="py-2 text-right text-gray-900 dark:text-gray-100">{item.quantity}</td>
                <td className="py-2 text-right text-gray-900 dark:text-gray-100 font-medium">
                  ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <td colSpan={3} className="pt-3 text-right font-semibold text-gray-700 dark:text-gray-300">Total</td>
              <td className="pt-3 text-right font-bold text-gray-900 dark:text-white text-base">
                ${Number(order.total_amount).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-center gap-3">
        {nextStatus && (
          <button
            onClick={advanceStatus}
            disabled={isUpdating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 capitalize"
          >
            {isUpdating ? 'Updating…' : `Mark as ${nextStatus}`}
          </button>
        )}
        {isCancellable && (
          <button
            onClick={cancelOrder}
            disabled={isUpdating}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  )
}

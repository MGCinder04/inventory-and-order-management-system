import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { ordersApi } from '../api/orders'
import { AnimatedButton } from '../components/AnimatedButton'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/formatters'

const STATUS_SEQUENCE = ['pending', 'confirmed', 'shipped', 'delivered']

const STATUS_BADGE_CLASSES = {
  pending:   'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300',
  confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300',
  shipped:   'bg-violet-100 text-violet-800 dark:bg-violet-500/10 dark:text-violet-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300',
}

const VALID_NEXT_STATUS = {
  pending: 'confirmed', confirmed: 'shipped', shipped: 'delivered', delivered: null, cancelled: null,
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
    } finally { setIsUpdating(false) }
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
    } finally { setIsUpdating(false) }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
  if (!order) return <div className="p-6 text-gray-500">Order not found.</div>

  const nextStatus = VALID_NEXT_STATUS[order.status]
  const isCancellable = order.status !== 'cancelled' && order.status !== 'delivered'
  const currentStepIndex = STATUS_SEQUENCE.indexOf(order.status)

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h1>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_BADGE_CLASSES[order.status] ?? ''}`}>
          {order.status}
        </span>
      </div>

      {order.status !== 'cancelled' && (
        <div className="bg-white dark:bg-[#1e2029] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] shadow-sm">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Progress</p>
          <div className="flex items-center">
            {STATUS_SEQUENCE.map((step, index) => {
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-all duration-500
                      ${isCompleted ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-white/[0.06] text-gray-400'}`}>
                      {isCompleted && !isCurrent ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
                    </div>
                    <span className={`text-xs capitalize font-semibold transition-colors ${isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                  {index < STATUS_SEQUENCE.length - 1 && (
                    <div className={`h-0.5 w-full mx-1 mb-5 rounded-full transition-all duration-700
                      ${index < currentStepIndex ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-white/[0.06]'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1e2029] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] shadow-sm">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Customer</p>
        <p className="font-bold text-gray-800 dark:text-gray-200">{order.customer?.full_name}</p>
        <p className="text-sm text-gray-400 mt-0.5">{order.customer?.email}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Placed {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
        </p>
      </div>

      <div className="bg-white dark:bg-[#1e2029] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] shadow-sm">
        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Items</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/[0.05]">
              <th className="text-left pb-2 font-medium text-gray-500 dark:text-gray-400">Product</th>
              <th className="text-right pb-2 font-medium text-gray-500 dark:text-gray-400">Unit Price</th>
              <th className="text-right pb-2 font-medium text-gray-500 dark:text-gray-400">Qty</th>
              <th className="text-right pb-2 font-medium text-gray-500 dark:text-gray-400">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {order.items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 text-gray-900 dark:text-gray-100 font-medium">
                  {item.product?.name ?? `Product #${item.product_id}`}
                  {item.product?.sku && <span className="text-xs text-gray-400 ml-1.5 font-mono">{item.product.sku}</span>}
                </td>
                <td className="py-2.5 text-right text-gray-500 dark:text-gray-400 tabular-nums">{formatCurrency(item.unit_price)}</td>
                <td className="py-2.5 text-right text-gray-900 dark:text-gray-100 tabular-nums">{item.quantity}</td>
                <td className="py-2.5 text-right font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  {formatCurrency(Number(item.unit_price) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 dark:border-white/10">
              <td colSpan={3} className="pt-3 text-right font-bold text-gray-700 dark:text-gray-300">Order Total</td>
              <td className="pt-3 text-right font-extrabold text-gray-900 dark:text-white text-lg tabular-nums">
                {formatCurrency(order.total_amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {nextStatus && (
          <AnimatedButton onClick={advanceStatus} disabled={isUpdating}>
            {isUpdating ? 'Updating…' : `Mark as ${nextStatus}`}
          </AnimatedButton>
        )}
        {isCancellable && (
          <button
            onClick={cancelOrder}
            disabled={isUpdating}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-sm font-bold transition-colors disabled:opacity-50"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  )
}

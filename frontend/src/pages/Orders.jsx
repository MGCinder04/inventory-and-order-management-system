import { useEffect, useState, useCallback } from 'react'
import { Eye, Trash2, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ordersApi } from '../api/orders'
import { productsApi } from '../api/products'
import { customersApi } from '../api/customers'
import { EmptyState } from '../components/EmptyState'
import { AnimatedButton } from '../components/AnimatedButton'
import { PageLoader } from '../components/PageLoader'
import { ProductPicker } from '../components/ProductPicker'
import { TypewriterText } from '../components/TypewriterText'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/formatters'

const PAGE_SIZE = 20

const STATUS_BADGE_CLASSES = {
  pending:   'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300',
  confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300',
  shipped:   'bg-violet-100 text-violet-800 dark:bg-violet-500/10 dark:text-violet-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300',
}

export default function Orders() {
  const { addToast } = useToast()
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await ordersApi.list({ limit: PAGE_SIZE, offset })
      setOrders(response.data.items)
      setTotal(response.data.total)
    } catch {
      addToast('Failed to load orders', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [offset, addToast])

  useEffect(() => { loadOrders() }, [loadOrders])

  async function handleDelete(order) {
    const actionLabel = order.status === 'cancelled' ? 'Delete' : 'Cancel & delete'
    if (!window.confirm(`${actionLabel} order #${order.id}?`)) return
    try {
      await ordersApi.remove(order.id)
      addToast('Order deleted — stock restored if applicable')
      loadOrders()
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to delete order', 'error')
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <TypewriterText text="Orders" speed={60} />
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{total} orders total</p>
        </div>
        <AnimatedButton onClick={() => setShowCreateModal(true)}>New Order</AnimatedButton>
      </div>

      <div className="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#141516] border-b border-gray-200 dark:border-white/[0.06]">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Total</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {isLoading ? (
              <tr><td colSpan={6}><PageLoader message="Loading orders…" /></td></tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState icon={ShoppingCart} title="No orders yet" description="Place your first order to see it here." />
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150">
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500 font-mono text-xs">#{order.id}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">
                    {order.customer?.full_name ?? `Customer #${order.customer_id}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_BADGE_CLASSES[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/orders/${order.id}`}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(order)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset((prev) => Math.max(0, prev - PAGE_SIZE))}
              className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
            >Previous</button>
            <button
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
              className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
            >Next</button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); loadOrders() }}
        />
      )}
    </div>
  )
}

function CreateOrderModal({ onClose, onCreated }) {
  const { addToast } = useToast()
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    Promise.all([customersApi.list({ limit: 100 }), productsApi.list({ limit: 100 })])
      .then(([c, p]) => {
        setCustomers(c.data.items)
        setProducts(p.data.items)
      })
      .catch(() => addToast('Failed to load form data', 'error'))
      .finally(() => setIsLoadingData(false))
  }, [addToast])

  const orderTotal = selectedItems.reduce(
    (sum, item) => sum + Number(item._product.price) * item.quantity, 0
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedCustomerId) { addToast('Please select a customer', 'error'); return }
    if (selectedItems.length === 0) { addToast('Select at least one product', 'error'); return }

    setIsSaving(true)
    try {
      await ordersApi.create({
        customer_id: parseInt(selectedCustomerId, 10),
        items: selectedItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      })
      addToast('Order created successfully')
      onCreated()
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to create order', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content bg-white dark:bg-[#1e2029] rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className="font-bold text-gray-900 dark:text-white">New Order</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-xl leading-none"
          >×</button>
        </div>

        {isLoadingData ? (
          <div className="p-8"><PageLoader message="Loading products…" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div>
              <label className={labelClass}>Customer <span className="text-red-500">*</span></label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className={selectClass}
              >
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Products <span className="text-red-500">*</span></label>
              <ProductPicker
                products={products}
                selectedItems={selectedItems}
                onItemsChange={setSelectedItems}
              />
            </div>

            {orderTotal > 0 && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Order Total</span>
                <span className="font-extrabold text-indigo-800 dark:text-indigo-300 tabular-nums">
                  {formatCurrency(orderTotal)}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={onClose} className={secondaryButtonClass}>Cancel</button>
              <AnimatedButton type="submit" disabled={isSaving}>
                {isSaving ? 'Creating…' : 'Create Order'}
              </AnimatedButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const labelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5'
const selectClass = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2038] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all'
const secondaryButtonClass = 'px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-full text-sm font-semibold transition-colors'

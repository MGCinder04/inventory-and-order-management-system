import { useEffect, useState, useCallback } from 'react'
import { Plus, Eye, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ordersApi } from '../api/orders'
import { productsApi } from '../api/products'
import { customersApi } from '../api/customers'
import { useToast } from '../hooks/useToast'

const PAGE_SIZE = 20

const STATUS_BADGE_CLASSES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  shipped: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
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

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  async function handleDelete(order) {
    const label = order.status === 'cancelled' ? 'Delete' : 'Cancel & delete'
    if (!window.confirm(`${label} order #${order.id}?`)) return
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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Total</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No orders yet.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">#{order.id}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                    {order.customer?.full_name ?? `Customer #${order.customer_id}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE_CLASSES[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 font-medium">
                    ${Number(order.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/orders/${order.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(order)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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
              className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <button
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
              className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Next
            </button>
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
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      customersApi.list({ limit: 100 }),
      productsApi.list({ limit: 100 }),
    ]).then(([c, p]) => {
      setCustomers(c.data.items)
      setProducts(p.data.items)
    }).catch(() => addToast('Failed to load customers/products', 'error'))
  }, [addToast])

  function addLineItem() {
    setOrderItems((prev) => [...prev, { product_id: '', quantity: 1 }])
  }

  function removeLineItem(index) {
    setOrderItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateLineItem(index, field, value) {
    setOrderItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedCustomerId) { addToast('Please select a customer', 'error'); return }
    const validItems = orderItems.filter((item) => item.product_id && item.quantity > 0)
    if (validItems.length === 0) { addToast('Add at least one product', 'error'); return }

    setIsSaving(true)
    try {
      await ordersApi.create({
        customer_id: parseInt(selectedCustomerId, 10),
        items: validItems.map((item) => ({
          product_id: parseInt(item.product_id, 10),
          quantity: parseInt(item.quantity, 10),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">New Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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

          <div className="space-y-2">
            <label className={labelClass}>Products</label>
            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  value={item.product_id}
                  onChange={(e) => updateLineItem(index, 'product_id', e.target.value)}
                  className={`${selectClass} flex-1`}
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (stock: {p.quantity_in_stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                  className={`${inputClass} w-20`}
                />
                {orderItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="text-red-400 hover:text-red-600 px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addLineItem}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              + Add product line
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className={secondaryButtonClass}>Cancel</button>
            <button type="submit" disabled={isSaving} className={primaryButtonClass}>
              {isSaving ? 'Creating…' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
const inputClass = 'px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
const selectClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
const primaryButtonClass = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50'
const secondaryButtonClass = 'px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors'

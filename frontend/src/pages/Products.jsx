import { useEffect, useState, useCallback } from 'react'
import { Pencil, Trash2, Package } from 'lucide-react'
import { productsApi } from '../api/products'
import { SearchBar } from '../components/SearchBar'
import { LowStockBadge } from '../components/LowStockBadge'
import { EmptyState } from '../components/EmptyState'
import { AnimatedButton } from '../components/AnimatedButton'
import { PageLoader } from '../components/PageLoader'
import { TypewriterText } from '../components/TypewriterText'
import { useToast } from '../hooks/useToast'
import { useSearch } from '../hooks/useSearch'
import { formatCurrency } from '../utils/formatters'

const LOW_STOCK_THRESHOLD = parseInt(import.meta.env.VITE_LOW_STOCK_THRESHOLD || '10', 10)
const PAGE_SIZE = 20
const EMPTY_FORM = { name: '', sku: '', description: '', price: '', quantity_in_stock: '' }

export default function Products() {
  const { addToast } = useToast()
  const { searchQuery, setSearchQuery, clearSearch } = useSearch()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await productsApi.list({ limit: PAGE_SIZE, offset, search: searchQuery || undefined })
      setProducts(response.data.items)
      setTotal(response.data.total)
    } catch {
      addToast('Failed to load products', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [offset, searchQuery, addToast])

  useEffect(() => { setOffset(0) }, [searchQuery])
  useEffect(() => { loadProducts() }, [loadProducts])

  function openCreateModal() { setEditingProduct(null); setForm(EMPTY_FORM); setShowModal(true) }
  function openEditModal(p) {
    setEditingProduct(p)
    setForm({ name: p.name, sku: p.sku, description: p.description ?? '', price: String(p.price), quantity_in_stock: String(p.quantity_in_stock) })
    setShowModal(true)
  }
  function closeModal() { setShowModal(false); setEditingProduct(null); setForm(EMPTY_FORM) }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSaving(true)
    const payload = {
      name: form.name.trim(), sku: form.sku.trim().toUpperCase(),
      description: form.description.trim() || null,
      price: form.price, quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    }
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, payload)
        addToast('Product updated')
      } else {
        await productsApi.create(payload)
        addToast('Product created')
      }
      closeModal(); loadProducts()
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to save product', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    try {
      await productsApi.remove(product.id)
      addToast('Product deleted'); loadProducts()
    } catch (error) {
      addToast(error.response?.data?.detail || 'Failed to delete product', 'error')
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            <TypewriterText text="Products" speed={60} />
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{total} items in catalogue</p>
        </div>
        <AnimatedButton onClick={openCreateModal}>Add Product</AnimatedButton>
      </div>

      <div className="w-72">
        <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={clearSearch} placeholder="Search by name or SKU…" />
      </div>

      <div className="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#141516] border-b border-gray-200 dark:border-white/[0.06]">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">SKU</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Price</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Stock</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {isLoading ? (
              <tr><td colSpan={5}><PageLoader message="Loading products…" /></td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5}>
                <EmptyState icon={Package} title="No products found"
                  description={searchQuery ? 'Try a different search term.' : 'Add your first product to get started.'} />
              </td></tr>
            ) : products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-150">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  {product.name}
                  {product.description && (
                    <p className="text-xs text-gray-400 font-normal truncate max-w-xs mt-0.5">{product.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{product.sku}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <LowStockBadge quantity={product.quantity_in_stock} threshold={LOW_STOCK_THRESHOLD} />
                    <span className="text-gray-900 dark:text-gray-100 tabular-nums">{product.quantity_in_stock}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEditModal(product)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(product)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={offset === 0} onClick={() => setOffset((p) => Math.max(0, p - PAGE_SIZE))} className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">Previous</button>
            <button disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset((p) => p + PAGE_SIZE)} className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">Next</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content bg-white dark:bg-[#1e2029] rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <h2 className="font-bold text-gray-900 dark:text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={closeModal} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <FormField label="Name" required>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="Product name" />
              </FormField>
              <FormField label="SKU" required>
                <input required value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className={inputClass} placeholder="e.g. PROD-001" />
              </FormField>
              <FormField label="Description">
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className={inputClass} placeholder="Optional" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Price (₹)" required>
                  <input required type="number" step="0.01" min="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputClass} placeholder="0.00" />
                </FormField>
                <FormField label="Stock Qty" required>
                  <input required type="number" min="0" value={form.quantity_in_stock} onChange={(e) => setForm((f) => ({ ...f, quantity_in_stock: e.target.value }))} className={inputClass} placeholder="0" />
                </FormField>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className={secondaryButtonClass}>Cancel</button>
                <AnimatedButton type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : editingProduct ? 'Update' : 'Create'}</AnimatedButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2038] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400'
const secondaryButtonClass = 'px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 rounded-full text-sm font-semibold transition-colors'

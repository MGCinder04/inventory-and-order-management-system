import { useState } from 'react'
import { Search, Plus, Minus, X, Check } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

const LOW_STOCK_DISPLAY_THRESHOLD = 10

export function ProductPicker({ products, selectedItems, onItemsChange }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function isSelected(productId) {
    return selectedItems.some((i) => i.product_id === productId)
  }

  function toggleProduct(product) {
    if (isSelected(product.id)) {
      onItemsChange(selectedItems.filter((i) => i.product_id !== product.id))
    } else {
      onItemsChange([...selectedItems, { product_id: product.id, quantity: 1, _product: product }])
    }
  }

  function updateQuantity(productId, delta) {
    onItemsChange(
      selectedItems.map((i) => {
        if (i.product_id !== productId) return i
        const newQuantity = Math.max(1, i.quantity + delta)
        return { ...i, quantity: newQuantity }
      })
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or SKU…"
          className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#2a2038] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5 scrollbar-thin">
        {filteredProducts.map((product) => {
          const selected = isSelected(product.id)
          const outOfStock = product.quantity_in_stock === 0
          const isLowStock = product.quantity_in_stock <= LOW_STOCK_DISPLAY_THRESHOLD && !outOfStock
          return (
            <button
              key={product.id}
              type="button"
              disabled={outOfStock && !selected}
              onClick={() => toggleProduct(product)}
              className={`relative text-left p-3 rounded-xl border-2 transition-all duration-200 group
                ${selected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10'
                  : outOfStock
                    ? 'border-gray-100 dark:border-white/5 opacity-45 cursor-not-allowed'
                    : 'border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:-translate-y-0.5 transition-transform'
                }`}
            >
              {selected && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shadow">
                  <Check size={9} className="text-white" strokeWidth={3} />
                </span>
              )}
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 pr-5 truncate leading-tight">
                {product.name}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{product.sku}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(product.price)}
                </span>
                <span
                  className={`text-xs font-medium ${
                    outOfStock
                      ? 'text-red-500'
                      : isLowStock
                        ? 'text-amber-500'
                        : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {outOfStock ? 'Out of stock' : `${product.quantity_in_stock} left`}
                </span>
              </div>
            </button>
          )
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-2 py-8 text-center text-sm text-gray-400">
            No products match &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-white/6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Selected — {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
          </p>
          {selectedItems.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1e2029] border border-gray-100 dark:border-white/5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {item._product.name}
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                  {formatCurrency(Number(item._product.price) * item.quantity)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product_id, -1)}
                  className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <Minus size={10} />
                </button>
                <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  disabled={item.quantity >= item._product.quantity_in_stock}
                  onClick={() => updateQuantity(item.product_id, 1)}
                  className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-40"
                >
                  <Plus size={10} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleProduct({ id: item.product_id })}
                  className="w-6 h-6 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors ml-0.5"
                >
                  <X size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Package, Users, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react'
import { analyticsApi } from '../api/analytics'
import { productsApi } from '../api/products'
import { StatCard } from '../components/StatCard'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/formatters'

const LOW_STOCK_THRESHOLD = parseInt(import.meta.env.VITE_LOW_STOCK_THRESHOLD || '10', 10)

const STATUS_DOT_COLORS = {
  pending: 'bg-amber-400',
  confirmed: 'bg-blue-500',
  shipped: 'bg-violet-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
}

export default function Dashboard() {
  const { addToast } = useToast()
  const [summary, setSummary] = useState(null)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [summaryResponse, productsResponse] = await Promise.all([
          analyticsApi.getSummary(),
          productsApi.list({ limit: 100 }),
        ])
        setSummary(summaryResponse.data)
        const lowStockProducts = productsResponse.data.items.filter(
          (p) => p.quantity_in_stock <= LOW_STOCK_THRESHOLD
        )
        setLowStockCount(lowStockProducts.length)
      } catch {
        addToast('Failed to load dashboard data', 'error')
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboardData()
  }, [addToast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={summary?.total_products ?? 0}
          icon={Package}
          accentColor="#3b82f6"
          fillPercent={72}
        />
        <StatCard
          title="Total Customers"
          value={summary?.total_customers ?? 0}
          icon={Users}
          accentColor="#8b5cf6"
          fillPercent={58}
        />
        <StatCard
          title="Total Orders"
          value={summary?.total_orders ?? 0}
          icon={ShoppingCart}
          accentColor="#10b981"
          fillPercent={85}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          icon={AlertTriangle}
          accentColor="#f59e0b"
          fillPercent={lowStockCount > 0 ? Math.min(100, lowStockCount * 10) : 5}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={18} className="text-emerald-500" />
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Total Revenue</h2>
        </div>
        <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
          {formatCurrency(summary?.total_revenue ?? 0)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Across all non-cancelled orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Orders by Status</h2>
          {summary?.orders_by_status?.length > 0 ? (
            <div className="space-y-3">
              {summary.orders_by_status.map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[status] ?? 'bg-gray-400'}`} />
                    <span className="capitalize text-sm text-gray-700 dark:text-gray-300">{status}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No orders yet.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Top Products</h2>
          {summary?.top_products?.length > 0 ? (
            <div className="space-y-3">
              {summary.top_products.map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-400 w-4">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {product.total_sold} sold
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(product.total_revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No sales data yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

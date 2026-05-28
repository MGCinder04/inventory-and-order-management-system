import { useEffect, useState } from 'react'
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react'
import { analyticsApi } from '../api/analytics'
import { productsApi } from '../api/products'
import { StatCard } from '../components/StatCard'
import { useToast } from '../hooks/useToast'

const LOW_STOCK_THRESHOLD = parseInt(import.meta.env.VITE_LOW_STOCK_THRESHOLD || '10', 10)

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
        const lowStock = productsResponse.data.items.filter(
          (p) => p.quantity_in_stock <= LOW_STOCK_THRESHOLD
        )
        setLowStockCount(lowStock.length)
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
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading…
      </div>
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
          colorClass="text-blue-600"
        />
        <StatCard
          title="Total Customers"
          value={summary?.total_customers ?? 0}
          icon={Users}
          colorClass="text-violet-600"
        />
        <StatCard
          title="Total Orders"
          value={summary?.total_orders ?? 0}
          icon={ShoppingCart}
          colorClass="text-emerald-600"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          icon={AlertTriangle}
          colorClass="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Orders by Status
          </h2>
          {summary?.orders_by_status?.length > 0 ? (
            <div className="space-y-2">
              {summary.orders_by_status.map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize text-sm text-gray-600 dark:text-gray-400">
                    {status}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No orders yet.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Top Products
          </h2>
          {summary?.top_products?.length > 0 ? (
            <div className="space-y-2">
              {summary.top_products.map((product) => (
                <div key={product.product_id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {product.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">{product.sku}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.total_sold} sold
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No sales data yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
          Total Revenue
        </h2>
        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
          ${Number(summary?.total_revenue ?? 0).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

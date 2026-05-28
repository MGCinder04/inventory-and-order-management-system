import { useEffect, useState } from 'react'
import { Package, Users, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react'
import { analyticsApi } from '../api/analytics'
import { productsApi } from '../api/products'
import { StatCard } from '../components/StatCard'
import { PageLoader } from '../components/PageLoader'
import { TypewriterText } from '../components/TypewriterText'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/formatters'

const LOW_STOCK_THRESHOLD = parseInt(import.meta.env.VITE_LOW_STOCK_THRESHOLD || '10', 10)

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#5868ff',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
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

  if (isLoading) return <PageLoader message="Loading dashboard…" />

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <TypewriterText text="Dashboard" speed={60} />
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Real-time overview of your operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          subtitle="In catalogue"
          value={summary?.total_products ?? 0}
          icon={Package}
          accentColor="#5868ff"
          fillPercent={72}
        />
        <StatCard
          title="Total Customers"
          subtitle="Registered"
          value={summary?.total_customers ?? 0}
          icon={Users}
          accentColor="#8b5cf6"
          fillPercent={58}
        />
        <StatCard
          title="Total Orders"
          subtitle="All time"
          value={summary?.total_orders ?? 0}
          icon={ShoppingCart}
          accentColor="#10b981"
          fillPercent={85}
        />
        <StatCard
          title="Low Stock Items"
          subtitle={`≤ ${LOW_STOCK_THRESHOLD} units`}
          value={lowStockCount}
          icon={AlertTriangle}
          accentColor="#f59e0b"
          fillPercent={lowStockCount > 0 ? Math.min(100, lowStockCount * 10) : 4}
        />
      </div>

      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1e2029] p-5 border border-gray-100 dark:border-white/[0.06] shadow-sm card-lift">
        <div className="pointer-events-none absolute -top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-0 group-hover:opacity-100 blur-3xl transition-all duration-700 bg-emerald-400/10" />
        <div className="relative flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-emerald-500" />
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Total Revenue
          </p>
        </div>
        <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
          {formatCurrency(summary?.total_revenue ?? 0)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Across all non-cancelled orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1e2029] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] shadow-sm card-lift">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Orders by Status</h2>
          {summary?.orders_by_status?.length > 0 ? (
            <div className="space-y-3">
              {summary.orders_by_status.map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: STATUS_COLORS[status] ?? '#6b7280' }}
                    />
                    <span className="capitalize text-sm text-gray-700 dark:text-gray-300">{status}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100 tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No orders yet.</p>
          )}
        </div>

        <div className="bg-white dark:bg-[#1e2029] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] shadow-sm card-lift">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Top Products</h2>
          {summary?.top_products?.length > 0 ? (
            <div className="space-y-3">
              {summary.top_products.map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-bold text-gray-300 dark:text-gray-600 w-4 tabular-nums">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs font-mono text-gray-400">{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                      {product.total_sold} sold
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(product.total_revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No sales data yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

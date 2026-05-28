import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts'
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react'
import { analyticsApi } from '../api/analytics'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/formatters'

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

const FALLBACK_CHART_COLOR = '#6b7280'

function ChartPanel({ icon: Icon, title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-blue-500" />
        <h2 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function Analytics() {
  const { addToast } = useToast()
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await analyticsApi.getSummary()
        setSummary(response.data)
      } catch {
        addToast('Failed to load analytics', 'error')
      } finally {
        setIsLoading(false)
      }
    }
    loadAnalytics()
  }, [addToast])

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
  }

  const dailyRevenueData = (summary?.daily_revenue ?? []).map((entry) => ({
    date: entry.date,
    revenue: Number(entry.revenue),
  }))

  const statusPieData = (summary?.orders_by_status ?? []).map((entry) => ({
    name: entry.status,
    value: entry.count,
  }))

  const topProductsData = (summary?.top_products ?? []).map((p) => ({
    name: p.name,
    sold: p.total_sold,
  }))

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>

      <ChartPanel icon={TrendingUp} title="Daily Revenue — last 30 days">
        {dailyRevenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">No revenue data for the last 30 days.</p>
        )}
      </ChartPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartPanel icon={PieIcon} title="Orders by Status">
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? FALLBACK_CHART_COLOR} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No order data yet.</p>
          )}
        </ChartPanel>

        <ChartPanel icon={BarChart3} title="Top 5 Products by Units Sold">
          {topProductsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }}
                />
                <Bar dataKey="sold" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No sales data yet.</p>
          )}
        </ChartPanel>
      </div>
    </div>
  )
}

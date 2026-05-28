import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts'
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react'
import { analyticsApi } from '../api/analytics'
import { PageLoader } from '../components/PageLoader'
import { TypewriterText } from '../components/TypewriterText'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/formatters'

const STATUS_COLORS = {
  pending:   '#f59e0b',
  confirmed: '#5868ff',
  shipped:   '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
}
const FALLBACK_CHART_COLOR = '#6b7280'

function ChartPanel({ icon: Icon, title, children }) {
  return (
    <div className="bg-white dark:bg-[#1e2029] rounded-2xl p-5 border border-gray-100 dark:border-white/[0.06] shadow-sm card-lift">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={15} className="text-indigo-500" />
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{title}</h2>
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

  if (isLoading) return <PageLoader message="Loading analytics…" />

  const dailyRevenueData = (summary?.daily_revenue ?? []).map((e) => ({ date: e.date, revenue: Number(e.revenue) }))
  const statusPieData = (summary?.orders_by_status ?? []).map((e) => ({ name: e.status, value: e.count }))
  const topProductsData = (summary?.top_products ?? []).map((p) => ({ name: p.name, sold: p.total_sold }))

  const tooltipStyle = {
    borderRadius: '0.75rem',
    border: 'none',
    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.2)',
    backgroundColor: '#1e2029',
    color: '#f2f4f8',
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          <TypewriterText text="Analytics" speed={60} />
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Last 30 days</p>
      </div>

      <ChartPanel icon={TrendingUp} title="Daily Revenue">
        {dailyRevenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="revenue" stroke="#5868ff" strokeWidth={2.5} dot={false}
                activeDot={{ r: 5, stroke: '#5868ff', strokeWidth: 2, fill: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 py-10 text-center">No revenue data for the last 30 days.</p>
        )}
      </ChartPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartPanel icon={PieIcon} title="Orders by Status">
          {statusPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? FALLBACK_CHART_COLOR} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-10 text-center">No order data yet.</p>
          )}
        </ChartPanel>

        <ChartPanel icon={BarChart3} title="Top 5 Products by Units Sold">
          {topProductsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="sold" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-10 text-center">No sales data yet.</p>
          )}
        </ChartPanel>
      </div>
    </div>
  )
}

import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Warehouse,
  BarChart3,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

const activeLinkClass =
  'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
const inactiveLinkClass =
  'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 min-h-screen">
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight">
          InvenOrder
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? activeLinkClass : inactiveLinkClass
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

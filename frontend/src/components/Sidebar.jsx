import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Warehouse,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useSidebar } from '../context/SidebarContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebar()

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 sidebar-transition border-r border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#141516] min-h-screen sticky top-0 h-screen z-20
        ${isCollapsed ? 'w-16' : 'w-56'}`}
    >
      <div
        className={`flex items-center border-b border-gray-200 dark:border-white/[0.06] h-14 px-3
          ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}
      >
        {!isCollapsed && (
          <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight select-none">
            InvenOrder
          </span>
        )}
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={isCollapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 group
              ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2'}
              ${isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!isCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="px-4 py-4 border-t border-gray-100 dark:border-white/[0.04]">
          <p className="text-xs text-gray-400 dark:text-gray-600">v1.0.0</p>
        </div>
      )}
    </aside>
  )
}

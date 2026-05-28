import { Menu } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { useSidebar } from '../context/SidebarContext'

export function Navbar() {
  const { toggle } = useSidebar()
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-white dark:bg-[#141516] border-b border-gray-200 dark:border-white/[0.06] shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <span className="md:hidden font-bold text-gray-900 dark:text-white text-sm tracking-tight">
          OrderHub
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  )
}

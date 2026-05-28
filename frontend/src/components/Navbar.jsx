import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <span className="md:hidden font-bold text-gray-900 dark:text-white text-sm tracking-tight">
        InvenOrder
      </span>
      <div className="hidden md:block" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}

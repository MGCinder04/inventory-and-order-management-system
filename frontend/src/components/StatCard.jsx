export function StatCard({ title, value, icon: Icon, colorClass = 'text-blue-600' }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
      {Icon && (
        <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-900 ${colorClass}`}>
          <Icon size={24} />
        </div>
      )}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

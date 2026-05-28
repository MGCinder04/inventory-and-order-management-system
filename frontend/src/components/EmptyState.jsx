export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="mb-4 p-5 rounded-full bg-gray-100 dark:bg-gray-800">
          <Icon size={32} className="text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <p className="text-base font-semibold text-gray-700 dark:text-gray-300">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500 max-w-xs">{description}</p>
      )}
    </div>
  )
}

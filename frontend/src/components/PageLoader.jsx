export function PageLoader({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="typewriter-loader">
        <div className="slide"><i /></div>
        <div className="paper" />
        <div className="keyboard" />
      </div>
      <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">{message}</p>
    </div>
  )
}

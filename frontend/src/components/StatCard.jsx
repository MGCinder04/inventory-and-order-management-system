export function StatCard({ title, subtitle, value, icon: Icon, accentColor = '#10b981', fillPercent = 76, trend }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1e2029] p-5 border border-gray-100 dark:border-white/[0.06] shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 card-lift">
      <div
        className="pointer-events-none absolute -top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-0 group-hover:opacity-100 blur-3xl transition-all duration-700"
        style={{ backgroundColor: `${accentColor}22` }}
      />

      <div className="relative">
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              {Icon && <Icon size={18} style={{ color: accentColor }} />}
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-neutral-200 text-sm leading-tight">
                {title}
              </p>
              {subtitle && (
                <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                trend.startsWith('+')
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>

        <p className="text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums tracking-tight">
          {value}
        </p>

        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.max(4, fillPercent))}%`, backgroundColor: accentColor }}
          />
        </div>
      </div>
    </div>
  )
}

export function StatCard({ title, value, icon: Icon, accentColor = '#10b981', fillPercent = 76 }) {
  return (
    <div className="card max-w-none w-full">
      <div className="title">
        <span style={{ backgroundColor: accentColor }}>
          {Icon && <Icon />}
        </span>
        <p className="title-text">{title}</p>
      </div>
      <div className="data">
        <p>{value}</p>
        <div className="range">
          <div className="fill" style={{ width: `${fillPercent}%`, backgroundColor: accentColor }} />
        </div>
      </div>
    </div>
  )
}

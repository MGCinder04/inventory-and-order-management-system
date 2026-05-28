import { useTheme } from '../hooks/useTheme'

function CloudSvg({ className }) {
  return (
    <svg className={className} viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="35" rx="35" ry="18" fill="white" />
      <ellipse cx="25" cy="25" rx="18" ry="16" fill="white" />
      <ellipse cx="52" cy="22" rx="20" ry="17" fill="white" />
    </svg>
  )
}

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <label className="switch" aria-label="Toggle dark mode" title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <input
        type="checkbox"
        checked={!isDark}
        onChange={toggleTheme}
      />
      <span className="slider">
        <span className="star star_1" />
        <span className="star star_2" />
        <span className="star star_3" />
        <CloudSvg className="cloud" />
      </span>
    </label>
  )
}

const ArrowSvg = ({ className }) => (
  <svg className={className} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
  </svg>
)

export function AnimatedButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`animated-button ${className}`}
    >
      <ArrowSvg className="arr-2" />
      <span className="btn-text">{children}</span>
      <span className="circle" aria-hidden="true" />
      <ArrowSvg className="arr-1" />
    </button>
  )
}

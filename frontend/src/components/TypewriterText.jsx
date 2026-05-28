import { useState, useEffect } from 'react'

const DEFAULT_TYPING_SPEED_MS = 40

export function TypewriterText({ text, speed = DEFAULT_TYPING_SPEED_MS, className = '' }) {
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCharCount((current) => {
        if (current >= text.length) {
          clearInterval(timer)
          return current
        }
        return current + 1
      })
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  const isComplete = charCount >= text.length

  return (
    <span className={className}>
      {text.slice(0, charCount)}
      {!isComplete && (
        <span
          className="inline-block w-[2px] h-[0.85em] bg-current align-middle ml-0.5 animate-pulse"
          aria-hidden="true"
        />
      )}
    </span>
  )
}

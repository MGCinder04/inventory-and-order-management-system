import { createContext, useCallback, useState } from 'react'

export const ToastContext = createContext(null)

const AUTO_DISMISS_MS = 4000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, AUTO_DISMISS_MS)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastStack toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastStack({ toasts, onRemove }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-white text-sm font-medium min-w-64 max-w-sm
            ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-white/70 hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

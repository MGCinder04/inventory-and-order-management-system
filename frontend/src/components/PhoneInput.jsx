import { useState } from 'react'

export const DEFAULT_COUNTRY_CODE = '+91'

const COUNTRY_CODES = [
  { code: '+91', label: '+91 India' },
  { code: '+1', label: '+1 US/CA' },
  { code: '+44', label: '+44 UK' },
  { code: '+61', label: '+61 AU' },
  { code: '+971', label: '+971 UAE' },
  { code: '+65', label: '+65 SG' },
]

function parseStoredPhone(storedPhone) {
  if (!storedPhone) return { countryCode: DEFAULT_COUNTRY_CODE, digits: '' }
  for (const { code } of COUNTRY_CODES) {
    if (storedPhone.startsWith(code)) {
      return { countryCode: code, digits: storedPhone.slice(code.length) }
    }
  }
  return { countryCode: DEFAULT_COUNTRY_CODE, digits: storedPhone }
}

export function PhoneInput({ initialValue = '', onChange, error, required = false }) {
  const parsed = parseStoredPhone(initialValue)
  const [countryCode, setCountryCode] = useState(parsed.countryCode)
  const [phoneDigits, setPhoneDigits] = useState(parsed.digits)

  function handleCountryCodeChange(newCode) {
    setCountryCode(newCode)
    onChange(`${newCode}${phoneDigits}`)
  }

  function handleDigitsChange(e) {
    const numericOnly = e.target.value.replace(/\D/g, '')
    setPhoneDigits(numericOnly)
    onChange(`${countryCode}${numericOnly}`)
  }

  return (
    <div>
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={(e) => handleCountryCodeChange(e.target.value)}
          className="shrink-0 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          {COUNTRY_CODES.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          required={required}
          placeholder="Phone number"
          value={phoneDigits}
          onChange={handleDigitsChange}
          className={`flex-1 px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:border-transparent transition-all
            ${error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'
            }`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

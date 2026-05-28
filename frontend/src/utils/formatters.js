const CURRENCY_LOCALE = 'en-IN'
const CURRENCY_CODE = 'INR'

export function formatCurrency(amount) {
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}

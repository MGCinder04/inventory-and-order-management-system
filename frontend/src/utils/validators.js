const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_DIGITS_ONLY_REGEX = /^\d+$/

export const MIN_PHONE_DIGITS = 7
export const MAX_PHONE_DIGITS = 15

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email.trim())
}

export function buildPhoneValidationError(digits) {
  if (!digits) return 'Phone number is required'
  if (!PHONE_DIGITS_ONLY_REGEX.test(digits)) return 'Phone number must contain digits only'
  if (digits.length < MIN_PHONE_DIGITS) return `Must be at least ${MIN_PHONE_DIGITS} digits`
  if (digits.length > MAX_PHONE_DIGITS) return `Must be at most ${MAX_PHONE_DIGITS} digits`
  return null
}

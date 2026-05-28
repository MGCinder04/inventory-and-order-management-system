import { useState, useCallback } from 'react'

export function useSearch(initialValue = '') {
  const [searchQuery, setSearchQuery] = useState(initialValue)

  const clearSearch = useCallback(() => setSearchQuery(''), [])

  return { searchQuery, setSearchQuery, clearSearch }
}

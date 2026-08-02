import { useEffect, useState } from 'react'

/** Returns `value`, but only updates after it's stopped changing for `delayMs`. */
export function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

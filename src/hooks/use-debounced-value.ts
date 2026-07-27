import { useEffect, useState } from 'react'

// Returns `value`, but only updates after it stops changing for `delayMs`.
// Use this on search inputs so we don't fire an API request on every keystroke.
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}

// Formats an ISO date string for display, e.g. "Jul 24, 2026, 13:46".
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: false,
  })
}

export function formatDateOnly(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    timeStyle: 'short',
    hour12: false,
  })
}

// Converts an ISO date string to the "YYYY-MM-DDTHH:mm" format <input type="datetime-local"> expects.
export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Converts a "YYYY-MM-DDTHH:mm" <input type="datetime-local"> value back to an ISO string.
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString()
}

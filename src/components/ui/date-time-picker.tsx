import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'

interface DateTimePickerProps {
  id: string
  value: string
  onChange: (value: string) => void
  'aria-invalid'?: boolean
}

function DateTimePicker({
  id,
  value,
  onChange,
  'aria-invalid': ariaInvalid,
}: DateTimePickerProps) {
  const selectedDate = parseLocalDateTime(value)
  const timeValue = selectedDate ? formatLocalTimeValue(selectedDate) : ''

  const setDate = (date: Date | undefined) => {
    if (!date) return

    const next = new Date(date)
    if (selectedDate) {
      next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0)
    }

    onChange(formatLocalDateTimeValue(next))
  }

  const setTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const next = selectedDate ? new Date(selectedDate) : new Date()
    next.setHours(hours, minutes, 0, 0)
    onChange(formatLocalDateTimeValue(next))
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <DatePicker
        id={id}
        value={selectedDate}
        onChange={setDate}
        aria-invalid={ariaInvalid}
      />
      <TimePicker
        value={timeValue}
        onChange={setTime}
        aria-invalid={ariaInvalid}
      />
    </div>
  )
}

function parseLocalDateTime(value: string): Date | undefined {
  if (!value) return undefined

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatLocalDateTimeValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join('T')
}

function formatLocalTimeValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export { DateTimePicker }

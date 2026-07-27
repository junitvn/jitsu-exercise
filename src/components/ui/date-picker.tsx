import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  id?: string
  value?: Date
  onChange: (date: Date | undefined) => void
  'aria-invalid'?: boolean
}

function DatePicker({
  id,
  value,
  onChange,
  'aria-invalid': ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const setDate = (date: Date | undefined) => {
    if (!date) return

    onChange(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full min-w-0 md:h-10 justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
            aria-invalid={ariaInvalid}
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        <span className="min-w-0 truncate">
          {value ? formatDisplayDate(value) : 'Pick a date'}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" positionerClassName="z-[1100]" className="z-[1100] w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={setDate}
          disabled={{ before: new Date(2000, 0, 1) }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
  })
}

export { DatePicker }

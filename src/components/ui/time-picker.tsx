import { useEffect, useRef, useState } from 'react'
import { CheckIcon, Clock3Icon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface TimePickerProps {
  value?: string
  onChange: (value: string) => void
  'aria-invalid'?: boolean
}

function TimePicker({
  value,
  onChange,
  'aria-invalid': ariaInvalid,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const [draftValue, setDraftValue] = useState(value ?? '')
  const minuteListRef = useRef<HTMLDivElement>(null)
  const selectedTime = parseTimeValue(value)
  const draftTime = parseTimeValue(draftValue)
  const displayValue = selectedTime ? formatTimeValue(selectedTime) : ''

  const setTime = (hours: number, minutes: number) => {
    setDraftValue(formatTimeValue({ hours, minutes }))
  }

  const setTimeToNow = () => {
    const now = new Date()
    setTime(now.getHours(), now.getMinutes())
  }

  const handleOpenChange = (
    nextOpen: boolean,
    eventDetails: { reason: string },
  ) => {
    if (nextOpen || eventDetails.reason === 'outside-press') {
      setDraftValue(value ?? '')
    }

    setOpen(nextOpen)
  }

  const commitTime = () => {
    const nextTime = parseTimeValue(draftValue)

    if (nextTime) {
      onChange(formatTimeValue(nextTime))
    }

    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      setDraftValue(value ?? '')
    }
  }, [open, value])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full md:h-10 justify-start font-normal tabular-nums',
              !displayValue && 'text-muted-foreground',
            )}
            aria-label={
              displayValue ? `Delivery time: ${displayValue}` : 'Choose delivery time'
            }
            aria-invalid={ariaInvalid}
          />
        }
      >
        <Clock3Icon data-icon="inline-start" />
        {displayValue || 'Time'}
      </PopoverTrigger>
      <PopoverContent align="end" positionerClassName="z-[1100]" className="z-[1100] w-64 gap-3 p-3">
        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
          <TimeColumn
            label="Hour"
            values={HOURS}
            selected={draftTime?.hours}
            onSelect={(hours) => setTime(hours, draftTime?.minutes ?? 0)}
            onEntryComplete={() =>
              minuteListRef.current
                ?.querySelector<HTMLElement>('[tabindex="0"]')
                ?.focus()
            }
          />
          <span
            className="mt-8 text-lg font-semibold text-muted-foreground"
            aria-hidden="true"
          >
            :
          </span>
          <TimeColumn
            label="Minute"
            values={MINUTES}
            selected={draftTime?.minutes}
            onSelect={(minutes) =>
              setTime(draftTime?.hours ?? new Date().getHours(), minutes)
            }
            listRef={minuteListRef}
          />
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <Button type="button" variant="ghost" size="sm" onClick={setTimeToNow}>
            Now
          </Button>
          <Button type="button" size="sm" onClick={commitTime}>
            <CheckIcon data-icon="inline-start" />
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface TimeColumnProps {
  label: string
  values: number[]
  selected: number | undefined
  onSelect: (value: number) => void
  listRef?: React.RefObject<HTMLDivElement | null>
  onEntryComplete?: () => void
}

function TimeColumn({
  label,
  values,
  selected,
  onSelect,
  listRef: externalListRef,
  onEntryComplete,
}: TimeColumnProps) {
  const internalListRef = useRef<HTMLDivElement>(null)
  const listRef = externalListRef ?? internalListRef
  const digitBufferRef = useRef('')
  const digitBufferTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const selectValueAt = (index: number, completeEntry = false) => {
    const nextIndex = (index + values.length) % values.length
    const nextValue = values[nextIndex]

    onSelect(nextValue)

    if (completeEntry && onEntryComplete) {
      onEntryComplete()
    } else {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-time-value="${nextValue}"]`)
        ?.focus()
    }
  }

  const handleDigitInput = (digit: string) => {
    clearTimeout(digitBufferTimeoutRef.current)

    let nextBuffer = `${digitBufferRef.current}${digit}`
    let nextValue = Number(nextBuffer)

    if (nextBuffer.length > 2 || !values.includes(nextValue)) {
      nextBuffer = digit
      nextValue = Number(digit)
    }

    digitBufferRef.current = nextBuffer

    const paddedValues = values.map((value) => String(value).padStart(2, '0'))
    const canAcceptAnotherDigit =
      nextBuffer.length < 2 &&
      paddedValues.some((value) => value.startsWith(nextBuffer))
    const isComplete = !canAcceptAnotherDigit

    selectValueAt(values.indexOf(nextValue), isComplete)

    if (isComplete) {
      digitBufferRef.current = ''
    } else {
      digitBufferTimeoutRef.current = setTimeout(() => {
        digitBufferRef.current = ''
      }, 1000)
    }
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (/^\d$/.test(event.key)) {
      event.preventDefault()
      handleDigitInput(event.key)
      return
    }

    clearTimeout(digitBufferTimeoutRef.current)
    digitBufferRef.current = ''

    let nextIndex: number | undefined

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = currentIndex + 1
        break
      case 'ArrowUp':
        nextIndex = currentIndex - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = values.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    selectValueAt(nextIndex)
  }

  useEffect(
    () => () => clearTimeout(digitBufferTimeoutRef.current),
    [],
  )

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'center' })
  }, [listRef, selected])

  return (
    <div className="min-w-0">
      <div className="mb-1.5 text-center text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <div
        ref={listRef}
        className="grid h-44 snap-y grid-cols-1 gap-1 overflow-y-auto rounded-lg border bg-muted/30 p-1"
        role="listbox"
        aria-label={`${label}. Type a number or use the up and down arrow keys`}
        aria-orientation="vertical"
      >
        {values.map((item, index) => {
          const isSelected = item === selected
          const isTabStop = isSelected || (selected === undefined && index === 0)

          return (
            <Button
              key={item}
              type="button"
              variant="ghost"
              role="option"
              aria-selected={isSelected}
              data-time-value={item}
              tabIndex={isTabStop ? 0 : -1}
              className={cn(
                'relative h-10 w-full snap-start rounded-md px-0 font-normal tabular-nums hover:bg-background focus-visible:ring-2',
                isSelected &&
                'bg-primary font-medium text-primary-foreground hover:bg-primary',
              )}
              onClick={() => onSelect(item)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {String(item).padStart(2, '0')}
              {isSelected && (
                <CheckIcon className="absolute right-1.5 size-3" aria-hidden="true" />
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

interface ParsedTime {
  hours: number
  minutes: number
}

const HOURS = Array.from({ length: 24 }, (_, index) => index)
const MINUTES = Array.from({ length: 60 }, (_, index) => index)

function parseTimeValue(value: string | undefined): ParsedTime | undefined {
  if (!value) return undefined

  const [hours, minutes] = value.split(':').map(Number)
  const isValid =
    Number.isInteger(hours) &&
    Number.isInteger(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59

  return isValid ? { hours, minutes } : undefined
}

function formatTimeValue({ hours, minutes }: ParsedTime): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}`
}

export { TimePicker }

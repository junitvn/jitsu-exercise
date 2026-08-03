import type { ReactNode } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface LabeledSelectItem<TValue extends string> {
  value: TValue
  label: string
}

interface LabeledSelectProps<TValue extends string> {
  id: string
  items: LabeledSelectItem<TValue>[]
  value: TValue
  onValueChange: (value: TValue | null) => void
  placeholder: string
  disabled?: boolean
  invalid?: boolean
  renderItem?: (item: LabeledSelectItem<TValue>) => ReactNode
}

export function LabeledSelect<TValue extends string>({
  id,
  items,
  value,
  onValueChange,
  placeholder,
  disabled,
  invalid,
  renderItem,
}: LabeledSelectProps<TValue>) {
  return (
    <Select items={items} value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className="h-10 w-full bg-background disabled:bg-input/50 disabled:opacity-70"
        aria-invalid={invalid}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem
              className="flex flex-row items-center gap-2 py-3"
              key={item.value || 'empty'}
              value={item.value}
            >
              {renderItem ? renderItem(item) : item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

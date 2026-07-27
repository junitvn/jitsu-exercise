import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  'aria-label': string
  clearLabel: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  clearLabel,
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden="true"
        className="absolute top-8 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        aria-label={props['aria-label']}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl pr-9 pl-9 text-sm md:text-base dark:bg-slate-900"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={clearLabel}
          onClick={() => onChange('')}
          className="absolute top-8 right-1.5 -translate-y-1/2 rounded-full"
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}

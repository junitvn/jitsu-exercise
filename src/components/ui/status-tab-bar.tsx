import { cn } from '@/lib/utils'

export interface StatusTabItem<TKey extends string = string> {
  key: TKey
  label: string
  dot: string
  count?: number
}

interface StatusTabBarProps<TKey extends string> {
  items: StatusTabItem<TKey>[]
  activeKey: TKey
  onChange: (key: TKey) => void
  columns: 2 | 3
}

const GRID_COLS_CLASS: Record<2 | 3, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
}

export function StatusTabBar<TKey extends string>({
  items,
  activeKey,
  onChange,
  columns,
}: StatusTabBarProps<TKey>) {
  return (
    <div
      className={cn(
        'sticky top-0 z-20 grid shrink-0 gap-1 rounded-xl bg-background',
        GRID_COLS_CLASS[columns],
      )}
    >
      {items.map((item) => {
        const isActive = activeKey === item.key

        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(item.key)}
            className={cn(
              'flex min-h-11 flex-col justify-center gap-0.5 rounded-md border px-2 py-1.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'border-primary bg-background shadow-sm ring-1 ring-primary/30'
                : 'border bg-transparent',
            )}
          >
            <span className="text-lg font-semibold leading-none tabular-nums text-foreground">
              {item.count ?? 0}
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <span className={cn('size-2.5 shrink-0 rounded-full', item.dot)} aria-hidden="true" />
              <span className={cn('truncate text-xs font-semibold', isActive && 'text-primary')}>
                {item.label}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

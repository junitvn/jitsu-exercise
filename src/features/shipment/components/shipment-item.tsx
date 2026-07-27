import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { formatDateOnly } from '@/utils/format-date'
import type { Shipment } from '@/features/shipment/types/shipment'

interface ShipmentItemProps {
  shipment: Shipment
  isSelected: boolean
  onSelect: () => void
  style?: CSSProperties
  className?: string
  arrivalMeta?: ReactNode
  detailMeta?: ReactNode
}

export function ShipmentItem({
  shipment,
  isSelected,
  onSelect,
  style,
  className,
  arrivalMeta,
  detailMeta,
}: ShipmentItemProps) {
  return (
    <button
      type="button"
      aria-current={isSelected ? 'true' : undefined}
      onClick={onSelect}
      style={style}
      className={cn(
        'relative flex w-full flex-row gap-0.5 border-t border-black/5 bg-transparent px-3 text-left transition-colors first:border-t-0 hover:bg-muted/50 dark:border-white/5',
        isSelected && 'bg-muted/40 pl-7 hover:bg-muted/40',
        className,
      )}
    >
      {isSelected && (
        <div
          className="absolute inset-y-2 left-3 w-2.5 rounded-l-full border-y-[2.5px] border-l-[5px] border-r-0 border-primary"
          aria-hidden="true"
        />
      )}
      <div className="flex w-full flex-col justify-center gap-0.5">
        <span className="flex w-full flex-row items-center justify-between">
          <span
            className={cn('truncate text-sm font-medium', isSelected && 'font-semibold text-primary')}
          >
            {shipment.client_name}
          </span>
          <span className="ml-2 shrink-0 text-[12px] tabular-nums text-muted-foreground">
            {arrivalMeta ?? formatDateOnly(shipment.arrival_date)}
          </span>
        </span>
        <span className="flex w-full items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{shipment.label}</span>
          {detailMeta && <span className="shrink-0 text-[12px] tabular-nums">{detailMeta}</span>}
        </span>
      </div>
    </button>
  )
}

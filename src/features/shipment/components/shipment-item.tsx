import { memo, type CSSProperties, type ReactNode } from 'react'
import { Package, PackageCheck, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateOnly } from '@/utils/format-date'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import type { Shipment, ShipmentStatus } from '@/features/shipment/types/shipment'

const SHIPMENT_STATUS_ICONS: Record<ShipmentStatus, typeof Package> = {
  OPEN: Package,
  IN_TRANSIT: Truck,
  DELIVERED: PackageCheck,
}

interface ShipmentItemProps {
  shipment: Shipment
  isSelected: boolean
  // Takes the id rather than being pre-bound to it, so parents (list/virtualizer)
  // can pass the same stable function to every row instead of allocating a new
  // closure per row on every render.
  onSelect: (id: string) => void
  style?: CSSProperties
  className?: string
  arrivalMeta?: ReactNode
}

function ShipmentItemComponent({
  shipment,
  isSelected,
  onSelect,
  style,
  className,
  arrivalMeta,
}: ShipmentItemProps) {
  const statusStyles = SHIPMENT_STATUS_STYLES[shipment.status]
  const StatusIcon = SHIPMENT_STATUS_ICONS[shipment.status]

  return (
    <button
      type="button"
      aria-current={isSelected ? 'true' : undefined}
      onClick={() => onSelect(shipment.id)}
      style={style}
      className={cn(
        'relative flex w-full flex-row  gap-3 border-t border-black/5 bg-transparent px-3 py-2 text-left transition-colors first:border-t-0 hover:bg-muted/50 dark:border-white/5',
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
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md',
        )}
        aria-hidden="true"
      >
        <StatusIcon className="size-6" style={{ color: statusStyles.markerColor }} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn('size-1.5 shrink-0 rounded-full', statusStyles.dot)}
            aria-hidden="true"
          />
          <span className="truncate">{statusStyles.label}</span>
          <span aria-hidden="true">-</span>
          <span className="shrink-0 tabular-nums">
            {arrivalMeta ?? formatDateOnly(shipment.arrival_date)}
          </span>
        </span>
        <span className="flex w-full flex-row items-center justify-between">
          <span
            className={cn('truncate text-sm font-medium', isSelected && 'font-semibold text-primary')}
          >
            {shipment.client_name}
          </span>
        </span>
        <span className="truncate text-xs text-muted-foreground">{shipment.label}</span>
      </div>
    </button>
  )
}

function isStyleEqual(a: CSSProperties | undefined, b: CSSProperties | undefined) {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height &&
    a.transform === b.transform &&
    a.position === b.position
  )
}

// The virtualizer rebuilds the `style` object (top/left/transform) on every
// render even when a row's position hasn't actually changed, and the parent
// list rebuilds its `shipments` array each render too. A default shallow
// prop-equality check would treat every row as changed and re-render the
// whole visible window on each scroll tick; comparing `style` and `shipment`
// by value/id lets rows that genuinely didn't change bail out.
export const ShipmentItem = memo(ShipmentItemComponent, (prev, next) => {
  return (
    prev.shipment === next.shipment &&
    prev.isSelected === next.isSelected &&
    prev.onSelect === next.onSelect &&
    prev.className === next.className &&
    prev.arrivalMeta === next.arrivalMeta &&
    isStyleEqual(prev.style, next.style)
  )
})

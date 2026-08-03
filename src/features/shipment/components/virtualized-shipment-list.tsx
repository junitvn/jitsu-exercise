import type { RefObject } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ShipmentItem } from '@/features/shipment/components/shipment-item'
import type { Shipment } from '@/features/shipment/types/shipment'

interface VirtualizedShipmentListProps {
  shipments: Shipment[]
  selectedId: string | undefined
  onSelect: (id: string) => void
  scrollRef: RefObject<HTMLDivElement | null>
  estimateSize?: number
  overscan?: number
}

export function VirtualizedShipmentList({
  shipments,
  selectedId,
  onSelect,
  scrollRef,
  estimateSize = 72,
  overscan = 8,
}: VirtualizedShipmentListProps) {
  const virtualizer = useVirtualizer({
    count: shipments.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })
  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
      {virtualItems.map((virtualRow) => {
        const shipment = shipments[virtualRow.index]
        const isSelected = selectedId === shipment.id

        return (
          <ShipmentItem
            key={shipment.id}
            shipment={shipment}
            isSelected={isSelected}
            onSelect={onSelect}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        )
      })}
    </div>
  )
}

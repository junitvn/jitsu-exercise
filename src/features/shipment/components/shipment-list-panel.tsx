import { useState } from 'react'
import { SearchInput } from '@/components/ui/search-input'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMediaQuery } from '@/hooks/use-media-query'
import { ShipmentGroupList } from '@/features/shipment/components/shipment-group-list'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

const STATUSES: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED']

interface ShipmentListPanelProps {
  selectedId: string | undefined
  selectedStatus: ShipmentStatus | undefined
  onSelect: (id: string) => void
}

/**
 * Left panel: a search box + one scrollable, virtualized list per status.
 * Search is debounced and forwarded to the API (`q` param) rather than
 * filtering in the browser, since the full shipment set can be huge.
 */
export function ShipmentListPanel({ selectedId, selectedStatus, onSelect }: ShipmentListPanelProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <aside className="flex min-h-0 flex-col border-b bg-white md:border-r md:border-b-0 dark:bg-slate-950">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 md:overflow-hidden dark:bg-slate-900/40">
        <SearchInput
          aria-label="Search shipments"
          placeholder="Search client or label…"
          value={search}
          onChange={setSearch}
          clearLabel="Clear shipment search"
          className="py-1 pt-3 sm:pt-2.5"
        />
        {STATUSES.map((status) => (
          <ShipmentGroupList
            key={status}
            status={status}
            search={debouncedSearch}
            isMobile={isMobile}
            selectedId={selectedId}
            selectedStatus={selectedStatus}
            onSelect={onSelect}
          />
        ))}
      </div>
    </aside>
  )
}

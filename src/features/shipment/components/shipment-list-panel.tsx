import { useState } from 'react'
import { SearchInput } from '@/components/ui/search-input'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ShipmentGroupList } from '@/features/shipment/components/shipment-group-list'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

interface ShipmentListPanelProps {
  selectedId: string | undefined
  selectedStatus: ShipmentStatus | undefined
  onSelect: (id: string) => void
}

export function ShipmentListPanel({ selectedId, selectedStatus, onSelect }: ShipmentListPanelProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  return (
    <aside className="flex min-h-0 flex-col border-b bg-white md:border-r md:border-b-0 dark:bg-slate-950">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 md:overflow-hidden dark:bg-slate-900/40 pb-2">
        <SearchInput
          aria-label="Search shipments"
          placeholder="Search client or label…"
          value={search}
          onChange={setSearch}
          clearLabel="Clear shipment search"
          className="py-1 pt-3 sm:pt-2.5"
        />
        <ShipmentGroupList
          search={debouncedSearch}
          selectedId={selectedId}
          selectedStatus={selectedStatus}
          onSelect={onSelect}
        />
      </div>
    </aside>
  )
}

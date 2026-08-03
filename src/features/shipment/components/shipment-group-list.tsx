import { useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { StatusTabBar } from '@/components/ui/status-tab-bar'
import { useShipments } from '@/features/shipment/hooks/use-shipments'
import { useShipmentCounts } from '@/features/shipment/hooks/use-shipment-counts'
import { VirtualizedShipmentList } from '@/features/shipment/components/virtualized-shipment-list'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

const ROW_HEIGHT = 72
const LOAD_MORE_THRESHOLD = ROW_HEIGHT * 4
const STATUSES: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED']

interface ShipmentGroupListProps {
  search: string
  selectedId: string | undefined
  selectedStatus: ShipmentStatus | undefined
  onSelect: (id: string) => void
}

export function ShipmentGroupList({
  search,
  selectedId,
  selectedStatus,
  onSelect,
}: ShipmentGroupListProps) {
  const [activeStatus, setActiveStatus] = useState<ShipmentStatus>(selectedStatus ?? 'OPEN')
  const scrollRef = useRef<HTMLDivElement>(null)
  const styles = SHIPMENT_STATUS_STYLES[activeStatus]

  useEffect(() => {
    if (selectedStatus) {
      setActiveStatus(selectedStatus)
    }
  }, [selectedStatus])

  const countRequests = useMemo(
    () =>
      STATUSES.filter((status) => status !== activeStatus).map((status) => ({
        key: status,
        status,
        search,
      })),
    [activeStatus, search],
  )
  const statusCounts = useShipmentCounts(countRequests)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useShipments(
    activeStatus,
    search,
  )

  const shipments = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages])
  const totalCount = data?.pages[0]?.totalCount

  const handleScroll = () => {
    const scrollElement = scrollRef.current
    if (!scrollElement || scrollElement.scrollTop <= 0 || !hasNextPage || isFetchingNextPage) return

    const distanceFromBottom =
      scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight

    if (distanceFromBottom <= LOAD_MORE_THRESHOLD) {
      fetchNextPage()
    }
  }

  return (
    <section
      aria-label={`${styles.label} shipments`}
      className="flex min-h-0 flex-1 flex-col gap-2"
    >
      <StatusTabBar<ShipmentStatus>
        columns={3}
        activeKey={activeStatus}
        onChange={setActiveStatus}
        items={STATUSES.map((status) => ({
          key: status,
          label: SHIPMENT_STATUS_STYLES[status].label,
          dot: SHIPMENT_STATUS_STYLES[status].dot,
          count: status === activeStatus ? totalCount ?? shipments.length : statusCounts.get(status),
        }))}
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-xl border bg-background"
      >
        {isLoading ? (
          <div className="space-y-2 p-2" aria-label={`Loading ${styles.label} shipments`}>
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-md border border-black/5 bg-muted/70 dark:border-white/5"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col gap-2 p-3 text-sm">
            <p className="text-destructive">
              Could not load {styles.label.toLowerCase()} shipments.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="w-fit rounded-md text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Retry
            </button>
          </div>
        ) : shipments.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            {search ? 'No matching shipments' : 'No shipments'}
          </p>
        ) : (
          <VirtualizedShipmentList
            shipments={shipments}
            selectedId={selectedId}
            onSelect={onSelect}
            scrollRef={scrollRef}
            estimateSize={ROW_HEIGHT}
          />
        )}

        {isFetchingNextPage && (
          <div className="sticky bottom-2 mx-auto flex w-fit items-center gap-1.5 rounded-full border bg-background/95 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
            <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
            Loading more
          </div>
        )}
      </div>
    </section>
  )
}

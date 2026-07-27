import { useEffect, useRef, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchShipments } from '@/features/shipment/api/shipment.api'
import { useShipments } from '@/features/shipment/hooks/use-shipments'
import { ShipmentItem } from '@/features/shipment/components/shipment-item'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

const ROW_HEIGHT = 72
const STATUSES: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED']

interface ShipmentGroupListProps {
  search: string
  selectedId: string | undefined
  selectedStatus: ShipmentStatus | undefined
  onSelect: (id: string) => void
}

/**
 * Status-grouped shipment list panel.
 *
 * Why virtualization + infinite scroll instead of loading everything:
 * a single day can have 100k+ shipments, so we only ask the API for
 * `SHIPMENTS_PAGE_SIZE` rows at a time (useShipments/useInfiniteQuery), and
 * only render the handful of rows currently visible in the scroll container
 * (useVirtualizer). Scrolling near the bottom fetches the next page.
 */
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

  const countQueries = useQueries({
    queries: STATUSES.map((status) => ({
      queryKey: ['shipments', 'status-count', status, search],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchShipments({ status, search, page: 1, signal }),
      staleTime: 30_000,
    })),
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useShipments(
    activeStatus,
    search,
  )

  const shipments = data?.pages.flatMap((page) => page.items) ?? []
  const totalCount = data?.pages[0]?.totalCount

  const virtualizer = useVirtualizer({
    count: shipments.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  const virtualItems = virtualizer.getVirtualItems()

  // Load the next page once the user has scrolled near the last rendered row.
  useEffect(() => {
    const lastItem = virtualItems.at(-1)
    if (!lastItem) return
    if (lastItem.index >= shipments.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [
    virtualItems,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    shipments.length,
  ])

  return (
    <section
      aria-label={`${styles.label} shipments`}
      className="flex min-h-0 flex-1 flex-col gap-2"
    >
      <div
        className="sticky top-0 z-20 grid shrink-0 grid-cols-3 gap-1 rounded-xl bg-background"
      >
        {STATUSES.map((status, index) => {
          const statusStyles = SHIPMENT_STATUS_STYLES[status]
          const countData = countQueries[index]?.data
          const count = status === activeStatus ? totalCount ?? shipments.length : countData?.totalCount
          const isActive = activeStatus === status

          return (
            <button
              key={status}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveStatus(status)}
              className={cn(
                'flex min-h-11 flex-col justify-center gap-0.5 rounded-md border px-2 py-1.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? cn(
                    'border-primary bg-background shadow-sm ring-1 ring-primary/30',
                    // statusStyles.groupHeader
                  )
                  : 'border bg-transparent',
              )}
            >
              <span className="text-lg font-semibold leading-none tabular-nums text-foreground">
                {count ?? 0}
              </span>
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  className={cn('size-2.5 shrink-0 rounded-full', statusStyles.dot)}
                  aria-hidden="true"
                />
                <span className={cn('truncate text-xs font-semibold', isActive && 'text-primary')}>
                  {statusStyles.label}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div
        ref={scrollRef}
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
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualItems.map((virtualRow) => {
              const shipment = shipments[virtualRow.index]
              const isSelected = selectedId === shipment.id

              return (
                <ShipmentItem
                  key={shipment.id}
                  shipment={shipment}
                  isSelected={isSelected}
                  onSelect={() => onSelect(shipment.id)}
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

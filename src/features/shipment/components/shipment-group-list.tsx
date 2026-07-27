import { useEffect, useId, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronDown, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/utils/format-date'
import { useShipments } from '@/features/shipment/hooks/use-shipments'
import { ShipmentItem } from '@/features/shipment/components/shipment-item'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

const ROW_HEIGHT = 72

interface ShipmentGroupListProps {
  status: ShipmentStatus
  search: string
  isMobile: boolean
  selectedId: string | undefined
  selectedStatus: ShipmentStatus | undefined
  onSelect: (id: string) => void
}

/**
 * One status group (e.g. "OPEN") in the shipment list panel.
 *
 * Why virtualization + infinite scroll instead of loading everything:
 * a single day can have 100k+ shipments, so we only ask the API for
 * `SHIPMENTS_PAGE_SIZE` rows at a time (useShipments/useInfiniteQuery), and
 * only render the handful of rows currently visible in the scroll container
 * (useVirtualizer). Scrolling near the bottom fetches the next page.
 */
export function ShipmentGroupList({
  status,
  search,
  isMobile,
  selectedId,
  selectedStatus,
  onSelect,
}: ShipmentGroupListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentId = useId()
  const previousIsMobile = useRef(isMobile)
  const [isExpanded, setIsExpanded] = useState(() => !isMobile || status === 'OPEN')
  const styles = SHIPMENT_STATUS_STYLES[status]

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useShipments(
    status,
    search,
  )

  const shipments = data?.pages.flatMap((page) => page.items) ?? []
  const totalCount = data?.pages[0]?.totalCount
  const isSelectedGroup = selectedStatus === status

  const virtualizer = useVirtualizer({
    count: shipments.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  const virtualItems = virtualizer.getVirtualItems()

  // Reset to the layout defaults when crossing the mobile breakpoint.
  useEffect(() => {
    if (previousIsMobile.current === isMobile) return
    previousIsMobile.current = isMobile
    setIsExpanded(!isMobile || status === 'OPEN')
  }, [isMobile, status])

  // A previously hidden scroll viewport needs to be measured when it opens.
  useEffect(() => {
    if (isExpanded) virtualizer.measure()
  }, [isExpanded, virtualizer])

  // Keep the group containing the selected shipment visible when selection changes.
  useEffect(() => {
    if (isSelectedGroup) setIsExpanded(true)
  }, [isSelectedGroup])

  // Load the next page once the user has scrolled near the last rendered row.
  useEffect(() => {
    if (!isExpanded) return
    const lastItem = virtualItems.at(-1)
    if (!lastItem) return
    if (lastItem.index >= shipments.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [
    isExpanded,
    virtualItems,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    shipments.length,
  ])

  return (
    <section
      aria-label={`${styles.label} shipments`}
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-xl border border-black/10 transition-[flex] duration-200',
        isExpanded ? 'flex-none md:flex-1' : 'flex-none',
        isSelectedGroup && 'border-primary',
      )}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="flex min-h-11 w-full items-center gap-2 border-b border-black/10 px-3 py-2 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <span className={cn('size-3 rounded-full', styles.dot)} aria-hidden="true" />
        <span className="flex-1 text-sm font-semibold">{styles.label}</span>
        <span className="min-w-7 rounded-full bg-white/70 px-2 py-0.5 text-center text-xs font-medium tabular-nums text-slate-600 dark:bg-black/20 dark:text-slate-300">
          {totalCount ?? shipments.length}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('size-4 transition-transform duration-200', !isExpanded && '-rotate-90')}
        />
      </button>

      {isExpanded && (
        <div
          id={contentId}
          ref={scrollRef}
          className="max-h-[216px] min-h-0 flex-1 overflow-auto overscroll-contain bg-background md:max-h-none"
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
              <p className="text-destructive">Could not load {styles.label.toLowerCase()} shipments.</p>
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
                    detailMeta={formatTime(shipment.arrival_date)}
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
      )}
    </section>
  )
}

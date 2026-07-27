import { useEffect, useId, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronDown, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateOnly, formatTime } from '@/utils/format-date'
import { useShipments } from '@/features/shipment/hooks/use-shipments'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

const ROW_HEIGHT = 72

interface ShipmentGroupListProps {
  status: ShipmentStatus
  search: string
  isMobile: boolean
  selectedId: string | undefined
  selectedStatus: ShipmentStatus | undefined
  onSelect: (id: string, status: ShipmentStatus) => void
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
                  <button
                    key={shipment.id}
                    type="button"
                    aria-current={isSelected ? 'true' : undefined}
                    onClick={() => onSelect(shipment.id, shipment.status)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={cn(
                      'relative flex w-full flex-row gap-0.5 border-t border-black/5 bg-transparent px-3 text-left transition-colors first:border-t-0 hover:bg-muted/50 dark:border-white/5',
                      isSelected && 'bg-muted/40 pl-7 hover:bg-muted/40',
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
                          className={cn(
                            'truncate text-sm font-medium',
                            isSelected && 'font-semibold text-primary',
                          )}
                        >
                          {shipment.client_name}
                        </span>
                        <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
                          {formatDateOnly(shipment.arrival_date)}
                        </span>
                      </span>
                      <span className="flex w-full items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{shipment.label}</span>
                        <span className="shrink-0 text-[12px] tabular-nums">
                          {formatTime(shipment.arrival_date)}
                        </span>
                      </span>
                    </div>
                  </button>
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

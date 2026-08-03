import { useEffect, useMemo, useRef, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatusTabBar } from '@/components/ui/status-tab-bar'
import { useAssignmentsInfinite } from '@/features/assignment/hooks/use-assignments-infinite'
import { useAssignmentCounts } from '@/features/assignment/hooks/use-assignment-counts'
import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_STYLES,
} from '@/features/assignment/components/assignment-status-styles'
import type { AssignmentStatus } from '@/features/assignment/types/assignment'

const ROW_HEIGHT = 64
const LOAD_MORE_THRESHOLD = ROW_HEIGHT * 4

interface AssignmentGroupProps {
  search: string
  selectedId?: string
  onSelect: (id: string) => void
}

export function AssignmentGroup({ search, selectedId, onSelect }: AssignmentGroupProps) {
  const [activeStatus, setActiveStatus] = useState<AssignmentStatus>('OPEN')
  const scrollRef = useRef<HTMLDivElement>(null)
  const styles = ASSIGNMENT_STATUS_STYLES[activeStatus]

  const countRequests = useMemo(
    () =>
      ASSIGNMENT_STATUSES.filter((status) => status !== activeStatus).map((status) => ({
        key: status,
        status,
        search,
      })),
    [activeStatus, search],
  )
  const statusCounts = useAssignmentCounts(countRequests)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useAssignmentsInfinite(activeStatus, search)

  const assignments = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages])
  const totalCount = data?.pages[0]?.totalCount

  const selectedAssignmentStatus = assignments.find(
    (assignment) => assignment.id === selectedId,
  )?.status

  useEffect(() => {
    if (selectedAssignmentStatus) {
      setActiveStatus(selectedAssignmentStatus)
    }
  }, [selectedAssignmentStatus])

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
      aria-label={`${styles.label} assignments`}
      className="flex min-h-0 flex-1 flex-col gap-2"
    >
      <StatusTabBar<AssignmentStatus>
        columns={2}
        activeKey={activeStatus}
        onChange={setActiveStatus}
        items={ASSIGNMENT_STATUSES.map((status) => ({
          key: status,
          label: ASSIGNMENT_STATUS_STYLES[status].label,
          dot: ASSIGNMENT_STATUS_STYLES[status].dot,
          count:
            status === activeStatus ? totalCount ?? assignments.length : statusCounts.get(status),
        }))}
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-xl border bg-background"
      >
        {isLoading ? (
          <p className="p-3 text-sm text-muted-foreground">Loading...</p>
        ) : isError ? (
          <div className="p-3 text-sm">
            <p className="text-destructive">Could not load assignments.</p>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => refetch()}
              className="px-0"
            >
              Retry
            </Button>
          </div>
        ) : assignments.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            {search ? 'No matching assignments' : `No ${styles.label.toLowerCase()} assignments`}
          </p>
        ) : (
          assignments.map((assignment) => {
            const isSelected = selectedId === assignment.id

            return (
              <button
                key={assignment.id}
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => onSelect(assignment.id)}
                className={cn(
                  'relative flex w-full flex-col gap-1 border-t px-3 py-2 text-left transition-colors first:border-t-0 hover:bg-muted/50',
                  isSelected && 'bg-muted/40 pl-6 hover:bg-muted/40',
                )}
              >
                {isSelected && (
                  <div
                    className="absolute inset-y-2 left-2 w-2.5 rounded-l-full border-y-[2.5px] border-l-[5px] border-r-0 border-primary"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    'truncate text-sm font-medium',
                    isSelected && 'font-semibold text-primary',
                  )}
                >
                  {assignment.label}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {assignment.shipment_count} shipments
                </span>
              </button>
            )
          })
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

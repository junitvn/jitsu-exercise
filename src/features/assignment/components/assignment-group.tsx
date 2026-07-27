import { useEffect, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAssignments } from '@/features/assignment/hooks/use-assignments'
import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_STYLES,
} from '@/features/assignment/components/assignment-status-styles'
import { fetchShipments } from '@/features/shipment/api/shipment.api'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import type { AssignmentStatus } from '@/features/assignment/types/assignment'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

const SHIPMENT_STATUSES: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED']
const SHIPMENT_STATUSES_EXCEPT_OPEN: ShipmentStatus[] = ['IN_TRANSIT', 'DELIVERED']

interface AssignmentGroupProps {
  search: string
  selectedId?: string
  onSelect: (id: string) => void
}

export function AssignmentGroup({ search, selectedId, onSelect }: AssignmentGroupProps) {
  const [activeStatus, setActiveStatus] = useState<AssignmentStatus>('OPEN')
  const { data: assignments = [], isLoading, isError, refetch } = useAssignments(undefined, search)
  const selectedAssignmentStatus = assignments.find(
    (assignment) => assignment.id === selectedId,
  )?.status
  const shipmentStatusCountQueries = useQueries({
    queries: assignments.flatMap((assignment) =>
      SHIPMENT_STATUSES.map((status) => ({
        queryKey: ['shipments', 'assignment-status-count', assignment.id, status],
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          fetchShipments({ status, assignmentId: assignment.id, page: 1, signal }),
        staleTime: 30_000,
      })),
    ),
  })
  const assignmentGroups = ASSIGNMENT_STATUSES.map((status) => ({
    status,
    assignments: assignments.filter((assignment) => assignment.status === status),
    styles: ASSIGNMENT_STATUS_STYLES[status],
  }))
  const activeAssignmentGroup = assignmentGroups.find((group) => group.status === activeStatus)
    ?? assignmentGroups[0]
  const styles = ASSIGNMENT_STATUS_STYLES[activeStatus]
  const getShipmentStatusCount = (assignmentId: string, status: ShipmentStatus) => {
    const assignmentIndex = assignments.findIndex((assignment) => assignment.id === assignmentId)
    if (assignmentIndex === -1) return 0

    const statusIndex = assignmentIndex * SHIPMENT_STATUSES.length
      + SHIPMENT_STATUSES.indexOf(status)
    const countData = shipmentStatusCountQueries[statusIndex]?.data

    return countData?.totalCount ?? countData?.items.length ?? 0
  }

  useEffect(() => {
    if (selectedAssignmentStatus) {
      setActiveStatus(selectedAssignmentStatus)
    }
  }, [selectedAssignmentStatus])

  return (
    <section
      aria-label={`${styles.label} assignments`}
      className="flex min-h-0 flex-1 flex-col gap-2"
    >
      <div
        className="sticky top-0 z-20 grid shrink-0 grid-cols-2 gap-1 rounded-xl bg-background"
      >
        {assignmentGroups.map((group) => {
          const isActive = activeStatus === group.status
          return (
            <button
              key={group.status}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveStatus(group.status)}
              className={cn(
                'flex min-h-11 flex-col justify-center gap-0.5 rounded-md border px-2 py-1.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? cn(
                    'border-primary bg-background shadow-sm ring-1 ring-primary/30',
                    // group.styles.groupHeader
                  )
                  : 'border bg-transparent',
              )}
            >
              <span className="text-lg font-semibold leading-none tabular-nums text-foreground">
                {group.assignments.length}
              </span>
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  className={cn('size-2.5 shrink-0 rounded-full', group.styles.dot)}
                  aria-hidden="true"
                />
                <span
                  className={cn('truncate text-xs font-semibold', isActive && 'text-primary')}
                >
                  {group.styles.label}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      <div
        className="min-h-0 flex-1 overflow-auto rounded-xl border bg-background"
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
        ) : activeAssignmentGroup.assignments.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            {search ? 'No matching assignments' : `No ${styles.label.toLowerCase()} assignments`}
          </p>
        ) : (
          activeAssignmentGroup.assignments.map((assignment) => {
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
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={cn(
                      'truncate text-sm font-medium',
                      isSelected && 'font-semibold text-primary',
                    )}
                  >
                    {assignment.label}
                  </span>
                  <span
                    className="size-1 shrink-0 rounded-full bg-muted-foreground/70"
                    aria-hidden="true"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {assignment.shipment_count} shipments
                  </span>
                </span>
                <span className="flex min-w-0 flex-wrap items-center gap-x-10 gap-y-0.5 text-xs text-muted-foreground">
                  {SHIPMENT_STATUSES_EXCEPT_OPEN.map((status) => {
                    const count = getShipmentStatusCount(assignment.id, status)
                    const statusStyles = SHIPMENT_STATUS_STYLES[status]

                    return (
                      <span key={status} className="flex min-w-0 items-center gap-1">
                        <span
                          className={cn('size-2 shrink-0 rounded-full', statusStyles.dot)}
                          aria-hidden="true"
                        />
                        <span className="truncate">{statusStyles.label}</span>
                        <span className="shrink-0 tabular-nums">{count}</span>
                      </span>
                    )
                  })}
                </span>
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}

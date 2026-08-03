import { useMemo, useRef, useState } from 'react'
import { ClipboardList, LoaderCircle } from 'lucide-react'
import { AsyncState } from '@/components/ui/async-state'
import { Badge } from '@/components/ui/badge'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import { CopyableId } from '@/components/ui/copyable-id'
import { toast } from '@/components/ui/toast'
import { StatusTabBar } from '@/components/ui/status-tab-bar'
import { useAssignment } from '@/features/assignment/hooks/use-assignment'
import { useDeleteAssignment } from '@/features/assignment/hooks/use-delete-assignment'
import { ASSIGNMENT_STATUS_STYLES } from '@/features/assignment/components/assignment-status-styles'
import { useAssignmentShipmentsInfinite } from '@/features/shipment/hooks/use-assignment-shipments-infinite'
import { useShipmentCounts } from '@/features/shipment/hooks/use-shipment-counts'
import { VirtualizedShipmentList } from '@/features/shipment/components/virtualized-shipment-list'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'

const SHIPMENT_STATUS_FILTERS = ['ALL', 'IN_TRANSIT', 'DELIVERED'] as const
type ShipmentStatusFilter = typeof SHIPMENT_STATUS_FILTERS[number]
const ROW_HEIGHT = 72
const LOAD_MORE_THRESHOLD = ROW_HEIGHT * 4

function filterLabel(filter: ShipmentStatusFilter) {
  return filter === 'ALL' ? 'All' : SHIPMENT_STATUS_STYLES[filter].label
}

function filterDot(filter: ShipmentStatusFilter) {
  return filter === 'ALL' ? 'bg-muted-foreground' : SHIPMENT_STATUS_STYLES[filter].dot
}

interface AssignmentDetailPanelProps {
  assignmentId?: string
  selectedShipmentId?: string
  onSelectShipment: (id: string) => void
  onDeleted: () => void
}

export function AssignmentDetailPanel({
  assignmentId,
  selectedShipmentId,
  onSelectShipment,
  onDeleted,
}: AssignmentDetailPanelProps) {
  const [activeShipmentStatus, setActiveShipmentStatus] = useState<ShipmentStatusFilter>('ALL')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data: assignment, isLoading, isError } = useAssignment(assignmentId)
  const deleteAssignment = useDeleteAssignment()

  const activeStatus = activeShipmentStatus === 'ALL' ? undefined : activeShipmentStatus
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingShipments,
  } = useAssignmentShipmentsInfinite(assignmentId, activeStatus)
  const shipments = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages])
  const activeTotalCount = data?.pages[0]?.totalCount

  // Counts for the inactive real-status tabs (the "All" tab reads the
  // assignment's own shipment_count, kept in sync on shipment writes).
  const countRequests = useMemo(
    () =>
      assignmentId
        ? (['IN_TRANSIT', 'DELIVERED'] as const)
            .filter((status) => status !== activeShipmentStatus)
            .map((status) => ({ key: status, status, assignmentId }))
        : [],
    [assignmentId, activeShipmentStatus],
  )
  const statusCounts = useShipmentCounts(countRequests)

  const handleScroll = () => {
    const scrollElement = scrollRef.current
    if (!scrollElement || scrollElement.scrollTop <= 0 || !hasNextPage || isFetchingNextPage) return

    const distanceFromBottom =
      scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight

    if (distanceFromBottom <= LOAD_MORE_THRESHOLD) {
      fetchNextPage()
    }
  }

  if (!assignmentId) {
    return (
      <section className="hidden min-h-0 items-center justify-center p-4 text-sm text-muted-foreground md:flex">
        <AsyncState
          variant="empty"
          icon={<ClipboardList aria-hidden="true" />}
          message="Select an assignment"
        />
      </section>
    )
  }

  if (isLoading) {
    return <AsyncState variant="loading" message="Loading..." />
  }

  if (isError || !assignment) {
    return <AsyncState variant="error" message="Could not load assignment." />
  }

  const statusStyles = ASSIGNMENT_STATUS_STYLES[assignment.status]
  const canDelete = assignment.shipment_count === 0
  const deleteDisabledReason = deleteAssignment.isPending
    ? 'Deletion is in progress.'
    : !canDelete
      ? 'Remove all shipments before deleting this assignment.'
      : undefined

  const tabCount = (filter: ShipmentStatusFilter) => {
    if (filter === activeShipmentStatus) return activeTotalCount
    if (filter === 'ALL') return assignment.shipment_count
    return statusCounts.get(filter)
  }

  const activeLabel = filterLabel(activeShipmentStatus)

  const onDelete = () => {
    if (!canDelete) return
    deleteAssignment.mutate(assignment.id, {
      onSuccess: onDeleted,
      onError: () => {
        toast.add({
          type: 'error',
          title: 'Failed to delete',
          description: 'Try again.',
        })
      },
    })
  }

  return (
    <section className="flex min-h-0 flex-col gap-[6px] overflow-hidden px-2 py-2 sm:px-2">
      <div className="shrink-0">
        <div className="hidden flex-row items-center justify-between gap-2 md:flex">
          <h2 className="text-2xl font-semibold truncate">{assignment.label}</h2>
          <Badge variant="outline" className={statusStyles.badge}>
            {statusStyles.label}
          </Badge>
        </div>
        <p className="hidden text-sm text-muted-foreground md:block">
          <CopyableId label="assignment ID" value={assignment.id} />
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 -mt-1">
        <div className="flex flex-row justify-between">
          <h3 className="text-sm font-semibold">{`Shipments`}</h3>
        </div>
        {assignment.shipment_count === 0 ? (
          <p className="text-sm text-muted-foreground">No shipments assigned.</p>
        ) : (
          <section
            aria-label={`${activeLabel} shipments`}
            className="flex min-h-0 flex-1 flex-col gap-2"
          >
            <StatusTabBar<ShipmentStatusFilter>
              columns={3}
              activeKey={activeShipmentStatus}
              onChange={setActiveShipmentStatus}
              items={SHIPMENT_STATUS_FILTERS.map((filter) => ({
                key: filter,
                label: filterLabel(filter),
                dot: filterDot(filter),
                count: tabCount(filter),
              }))}
            />
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="min-h-0 flex-1 overflow-auto overscroll-contain rounded-xl border bg-background"
            >
              {isLoadingShipments ? (
                <p className="p-3 text-sm text-muted-foreground">Loading...</p>
              ) : shipments.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">
                  No {activeLabel.toLowerCase()} shipments.
                </p>
              ) : (
                <VirtualizedShipmentList
                  shipments={shipments}
                  selectedId={selectedShipmentId}
                  onSelect={onSelectShipment}
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
        )}
      </div>

      <div className="mt-auto flex w-full shrink-0 flex-row items-end justify-end">
        <ConfirmDeleteButton
          label="Delete assignment"
          dialogTitle="Delete assignment?"
          dialogDescription={
            <>This will permanently delete {assignment.label}. This action cannot be undone.</>
          }
          onConfirm={onDelete}
          isPending={deleteAssignment.isPending}
          disabledReason={deleteDisabledReason}
          className="w-full"
        />
      </div>
    </section>
  )
}

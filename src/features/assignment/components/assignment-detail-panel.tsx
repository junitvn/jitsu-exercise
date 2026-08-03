import { useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ClipboardList } from 'lucide-react'
import { AsyncState } from '@/components/ui/async-state'
import { Badge } from '@/components/ui/badge'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import { CopyableId } from '@/components/ui/copyable-id'
import { toast } from '@/components/ui/toast'
import { StatusTabBar } from '@/components/ui/status-tab-bar'
import { useAssignment } from '@/features/assignment/hooks/use-assignment'
import { useDeleteAssignment } from '@/features/assignment/hooks/use-delete-assignment'
import { ASSIGNMENT_STATUS_STYLES } from '@/features/assignment/components/assignment-status-styles'
import { useAssignmentShipments } from '@/features/shipment/hooks/use-assignment-shipments'
import { ShipmentItem } from '@/features/shipment/components/shipment-item'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'

const SHIPMENT_STATUS_FILTERS = ['ALL', 'IN_TRANSIT', 'DELIVERED'] as const
type ShipmentStatusFilter = typeof SHIPMENT_STATUS_FILTERS[number]
const ROW_HEIGHT = 72

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
  const { data: shipments = [] } = useAssignmentShipments(assignmentId)
  const deleteAssignment = useDeleteAssignment()
  const shipmentGroups = useMemo(
    () =>
      SHIPMENT_STATUS_FILTERS.map((status) => {
        if (status === 'ALL') {
          return {
            status,
            shipments,
            styles: {
              label: 'All',
              dot: 'bg-muted-foreground',
            },
          }
        }

        return {
          status,
          shipments: shipments.filter((shipment) => shipment.status === status),
          styles: SHIPMENT_STATUS_STYLES[status],
        }
      }),
    [shipments],
  )
  const activeShipmentGroup = shipmentGroups.find((group) => group.status === activeShipmentStatus)
    ?? shipmentGroups[0]
  // Only the visible rows are mounted -- an assignment can have a large
  // shipment set, and this list previously rendered every row into the DOM.
  const virtualizer = useVirtualizer({
    count: activeShipmentGroup.shipments.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })
  const virtualItems = virtualizer.getVirtualItems()

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
  const canDelete = shipments.length === 0
  const deleteDisabledReason = deleteAssignment.isPending
    ? 'Deletion is in progress.'
    : !canDelete
      ? 'Remove all shipments before deleting this assignment.'
      : undefined

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
        {shipments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shipments assigned.</p>
        ) : (
          <section
            aria-label={`${activeShipmentGroup.styles.label} shipments`}
            className="flex min-h-0 flex-1 flex-col gap-2"
          >
            <StatusTabBar<ShipmentStatusFilter>
              columns={3}
              activeKey={activeShipmentStatus}
              onChange={setActiveShipmentStatus}
              items={shipmentGroups.map((group) => ({
                key: group.status,
                label: group.styles.label,
                dot: group.styles.dot,
                count: group.shipments.length,
              }))}
            />
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-auto rounded-xl border bg-background"
            >
              {activeShipmentGroup.shipments.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">
                  No {activeShipmentGroup.styles.label.toLowerCase()} shipments.
                </p>
              ) : (
                <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                  {virtualItems.map((virtualRow) => {
                    const shipment = activeShipmentGroup.shipments[virtualRow.index]
                    const isSelected = selectedShipmentId === shipment.id

                    return (
                      <ShipmentItem
                        key={shipment.id}
                        shipment={shipment}
                        isSelected={isSelected}
                        onSelect={onSelectShipment}
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

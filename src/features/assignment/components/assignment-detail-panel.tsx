import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { AsyncState } from '@/components/ui/async-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyableId } from '@/components/ui/copyable-id'
import { toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useAssignment } from '@/features/assignment/hooks/use-assignment'
import { useDeleteAssignment } from '@/features/assignment/hooks/use-delete-assignment'
import { ASSIGNMENT_STATUS_STYLES } from '@/features/assignment/components/assignment-status-styles'
import { useAssignmentShipments } from '@/features/shipment/hooks/use-assignment-shipments'
import { ShipmentItem } from '@/features/shipment/components/shipment-item'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'

const SHIPMENT_STATUS_FILTERS = ['ALL', 'IN_TRANSIT', 'DELIVERED'] as const
type ShipmentStatusFilter = typeof SHIPMENT_STATUS_FILTERS[number]

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
  const { data: assignment, isLoading, isError } = useAssignment(assignmentId)
  const { data: shipments = [] } = useAssignmentShipments(assignmentId)
  const deleteAssignment = useDeleteAssignment()
  const selectedShipmentStatus = shipments.find(
    (shipment) => shipment.id === selectedShipmentId,
  )?.status
  const shipmentGroups = SHIPMENT_STATUS_FILTERS.map((status) => {
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
  })
  const activeShipmentGroup = shipmentGroups.find((group) => group.status === activeShipmentStatus)
    ?? shipmentGroups[0]

  useEffect(() => {
    if (selectedShipmentStatus) {
      setActiveShipmentStatus(selectedShipmentStatus === 'OPEN' ? 'ALL' : selectedShipmentStatus)
    }
  }, [selectedShipmentStatus])

  if (!assignmentId) {
    return (
      <section className="hidden min-h-0 items-center justify-center p-4 text-sm text-muted-foreground md:flex">
        <AsyncState variant="empty" message="Select an assignment" />
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
          <h2 className="text-2xl font-semibold">{assignment.label}</h2>
          <Badge variant="outline" className={statusStyles.badge}>
            {statusStyles.label}
          </Badge>
        </div>
        <p className="hidden text-sm text-muted-foreground md:block">
          <CopyableId label="assignment ID" value={assignment.id} />
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
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
            <div
              className="sticky top-0 z-20 grid shrink-0 grid-cols-3 gap-1 rounded-xl bg-background"
            >
              {shipmentGroups.map((group) => {
                const isActive = activeShipmentStatus === group.status

                return (
                  <button
                    key={group.status}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveShipmentStatus(group.status)}
                    className={cn(
                      'flex min-h-11 flex-col justify-center gap-0.5 rounded-md border px-2 py-1.5 text-left transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive
                        ? cn(
                          'border-primary bg-background shadow-sm ring-1 ring-primary/30',
                        )
                        : 'border bg-transparent',
                    )}
                  >
                    <span className="text-lg font-semibold leading-none tabular-nums text-foreground">
                      {group.shipments.length}
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
              {activeShipmentGroup.shipments.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">
                  No {activeShipmentGroup.styles.label.toLowerCase()} shipments.
                </p>
              ) : (
                activeShipmentGroup.shipments.map((shipment) => {
                  const isSelected = selectedShipmentId === shipment.id

                  return (
                    <ShipmentItem
                      key={shipment.id}
                      shipment={shipment}
                      isSelected={isSelected}
                      onSelect={() => onSelectShipment(shipment.id)}
                      className="min-h-[72px]"
                    />
                  )
                })
              )}
            </div>
          </section>
        )}
      </div>

      <div className="mt-auto flex w-full shrink-0 flex-row items-end justify-end">
        <Tooltip disabled={!deleteDisabledReason}>
          <TooltipTrigger
            render={
              <span
                className="inline-flex w-full"
                tabIndex={deleteDisabledReason ? 0 : undefined}
              />
            }
          >
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    disabled={Boolean(deleteDisabledReason)}
                  />
                }
              >
                <Trash2 aria-hidden="true" />
                {deleteAssignment.isPending ? 'Deleting…' : 'Delete assignment'}
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete assignment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {assignment.label}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={onDelete}>
                    Delete assignment
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </TooltipTrigger>
          <TooltipContent>{deleteDisabledReason}</TooltipContent>
        </Tooltip>
      </div>
    </section>
  )
}

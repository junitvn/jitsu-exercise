import { Trash2 } from 'lucide-react'
import { AsyncState } from '@/components/ui/async-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { formatDateOnly, formatTime } from '@/utils/format-date'
import { useAssignment } from '@/features/assignment/hooks/use-assignment'
import { useDeleteAssignment } from '@/features/assignment/hooks/use-delete-assignment'
import { ASSIGNMENT_STATUS_STYLES } from '@/features/assignment/components/assignment-status-styles'
import { useAssignmentShipments } from '@/features/shipment/hooks/use-assignment-shipments'
import { ShipmentItem } from '@/features/shipment/components/shipment-item'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

const SHIPMENT_STATUS_ORDER: Record<ShipmentStatus, number> = {
  OPEN: 0,
  IN_TRANSIT: 1,
  DELIVERED: 2,
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
  const { data: assignment, isLoading, isError } = useAssignment(assignmentId)
  const { data: shipments = [] } = useAssignmentShipments(assignmentId)
  const deleteAssignment = useDeleteAssignment()

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
  const orderedShipments = [...shipments].sort(
    (shipmentA, shipmentB) =>
      SHIPMENT_STATUS_ORDER[shipmentA.status] - SHIPMENT_STATUS_ORDER[shipmentB.status],
  )

  const onDelete = () => {
    if (!canDelete) return
    deleteAssignment.mutate(assignment.id, { onSuccess: onDeleted })
  }

  return (
    <section className="flex min-h-0 flex-col gap-3 overflow-hidden px-2 py-2 sm:px-3">
      <div className="shrink-0">
        <div className="flex flex-row items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold">{assignment.label}</h2>
          <Badge variant="outline" className={statusStyles.badge}>
            {statusStyles.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{assignment.id}</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex flex-row justify-between">
          <h3 className="text-sm font-semibold">{`Shipments (${shipments.length})`}</h3>
        </div>
        {shipments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shipments assigned.</p>
        ) : (
          <div className="min-h-0 overflow-auto rounded-xl border border-black/10">
            {orderedShipments.map((shipment) => {
              const isSelected = selectedShipmentId === shipment.id
              const shipmentStatusStyles = SHIPMENT_STATUS_STYLES[shipment.status]

              return (
                <ShipmentItem
                  key={shipment.id}
                  shipment={shipment}
                  isSelected={isSelected}
                  onSelect={() => onSelectShipment(shipment.id)}
                  className="min-h-[72px]"
                  arrivalMeta={`${formatDateOnly(shipment.arrival_date)}, ${formatTime(
                    shipment.arrival_date,
                  )}`}
                  detailMeta={
                    <span className="flex flex-row items-center gap-2">
                      <span
                        className={cn('size-1.5 rounded-full', shipmentStatusStyles.dot)}
                        aria-hidden="true"
                      />
                      {shipmentStatusStyles.label}
                    </span>
                  }
                />
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-auto flex shrink-0 flex-col">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="destructive"
                disabled={!canDelete || deleteAssignment.isPending}
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
        {!canDelete && (
          <p className="mt-2 text-xs text-muted-foreground">
            Remove all shipments from this assignment before deleting it.
          </p>
        )}
        {deleteAssignment.isError && (
          <p className="mt-2 text-xs text-destructive">Failed to delete assignment. Try again.</p>
        )}
      </div>
    </section>
  )
}

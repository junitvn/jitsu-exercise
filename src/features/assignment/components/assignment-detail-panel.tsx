import { Trash2 } from 'lucide-react'
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
import type { Shipment } from '@/features/shipment/types/shipment'

interface AssignmentDetailPanelProps {
  assignmentId?: string
  selectedShipmentId?: string
  onSelectShipment: (id: string, shipments: Shipment[]) => void
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
        Select an assignment
      </section>
    )
  }

  if (isLoading) {
    return <section className="p-4 text-sm text-muted-foreground">Loading…</section>
  }

  if (isError || !assignment) {
    return <section className="p-4 text-sm text-destructive">Could not load assignment.</section>
  }

  const statusStyles = ASSIGNMENT_STATUS_STYLES[assignment.status]
  const canDelete = shipments.length === 0

  const onDelete = () => {
    if (!canDelete) return
    deleteAssignment.mutate(assignment.id, { onSuccess: onDeleted })
  }

  return (
    <section className="flex min-h-0 flex-col gap-3 overflow-auto px-4 py-2">
      <div>
        <div className="flex flex-row items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold">{assignment.label}</h2>
          <Badge variant="outline" className={statusStyles.badge}>
            {statusStyles.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{assignment.id}</p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-row justify-between">
          <h3 className="text-sm font-semibold">{`Shipments (${shipments.length})`}</h3>
        </div>
        {shipments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shipments assigned.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-black/10">
            {shipments.map((shipment) => {
              const isSelected = selectedShipmentId === shipment.id

              return (
                <button
                  key={shipment.id}
                  type="button"
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => onSelectShipment(shipment.id, shipments)}
                  className={cn(
                    'relative flex min-h-[72px] w-full flex-row gap-0.5 border-t border-black/5 bg-transparent px-3 text-left transition-colors first:border-t-0 hover:bg-muted/50 dark:border-white/5',
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
      </div>

      <div className="border-t pt-4">
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

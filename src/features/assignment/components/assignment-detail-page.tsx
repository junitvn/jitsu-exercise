import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CopyableId } from '@/components/ui/copyable-id'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { AssignmentDetailPanel } from '@/features/assignment/components/assignment-detail-panel'
import { ASSIGNMENT_STATUS_STYLES } from '@/features/assignment/components/assignment-status-styles'
import { useAssignment } from '@/features/assignment/hooks/use-assignment'
import { ShipmentDetailPanel } from '@/features/shipment/components/shipment-detail-panel'
import { useAssignmentShipments } from '@/features/shipment/hooks/use-assignment-shipments'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/use-ui-store'

export function AssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const navigate = useNavigate()
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | undefined>()
  const { data: assignment } = useAssignment(assignmentId)
  const { data: selectedAssignmentShipments = [] } = useAssignmentShipments(assignmentId)
  const setMobileHeader = useUIStore((state) => state.setMobileHeader)
  const clearMobileHeader = useUIStore((state) => state.clearMobileHeader)
  const statusStyles = assignment ? ASSIGNMENT_STATUS_STYLES[assignment.status] : undefined

  useEffect(() => {
    setMobileHeader({
      title: (
        <div className="flex min-w-0 items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Back to assignments"
            onClick={() => navigate('/assignments')}
            className="-ml-2"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center">
              <span className="min-w-0 flex-1 truncate text-md font-semibold leading-5 tracking-tight">
                {assignment?.label ?? 'Assignment Detail'}
              </span>
              {statusStyles && (
                <Badge variant="outline" className={cn(statusStyles.badge, 'h-6 px-2 text-xs')}>
                  {statusStyles.label}
                </Badge>
              )}
            </div>
            {assignment && (
              <CopyableId
                label="assignment ID"
                value={assignment.id}
                className="text-xs font-normal leading-4 text-muted-foreground"
              />
            )}
          </div>
        </div>
      ),
    })

    return clearMobileHeader
  }, [
    assignment?.id,
    assignment?.label,
    clearMobileHeader,
    navigate,
    setMobileHeader,
    statusStyles,
  ])

  const clearSelectedShipment = () => {
    setSelectedShipmentId(undefined)
  }

  return (
    <main className="h-svh overflow-hidden bg-slate-50 md:p-4 dark:bg-slate-950">
      <div className="flex h-full max-w-[1600px] flex-col overflow-hidden border bg-background shadow-sm md:rounded-2xl">
        <AssignmentDetailPanel
          assignmentId={assignmentId}
          selectedShipmentId={selectedShipmentId}
          onSelectShipment={setSelectedShipmentId}
          onDeleted={() => navigate('/assignments')}
        />
      </div>

      <Sheet
        open={Boolean(selectedShipmentId)}
        onOpenChange={(open) => !open && clearSelectedShipment()}
      >
        <SheetContent side="bottom" aria-label="Shipment details" className="md:hidden">
          <ShipmentDetailPanel
            shipmentId={selectedShipmentId}
            shipments={selectedAssignmentShipments}
            onClose={clearSelectedShipment}
            onDeleted={clearSelectedShipment}
            className="max-h-[85svh]"
          />
        </SheetContent>
      </Sheet>
    </main>
  )
}

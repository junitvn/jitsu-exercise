import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useMediaQuery } from '@/hooks/use-media-query'
import { AssignmentDetailPanel } from '@/features/assignment/components/assignment-detail-panel'
import { AssignmentGroup } from '@/features/assignment/components/assignment-group'
import { ASSIGNMENT_STATUSES } from '@/features/assignment/components/assignment-status-styles'
import { CreateAssignmentDialog } from '@/features/assignment/components/create-assignment-dialog'
import { ShipmentDetailPanel } from '@/features/shipment/components/shipment-detail-panel'
import { useAssignmentShipments } from '@/features/shipment/hooks/use-assignment-shipments'
import { useUIStore } from '@/store/use-ui-store'

export function AssignmentPage() {
  const [search, setSearch] = useState('')
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | undefined>()
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | undefined>()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 300)
  const { data: selectedAssignmentShipments = [] } = useAssignmentShipments(selectedAssignmentId)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const setMobileHeader = useUIStore((state) => state.setMobileHeader)
  const clearMobileHeader = useUIStore((state) => state.clearMobileHeader)
  const showMobileShipmentSheet = isMobile && selectedShipmentId

  useEffect(() => {
    setMobileHeader({
      title: 'Assignments',
      action: (
        <Button
          type="button"
          aria-label="Create assignment"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={24} color="#fff" />
          <span>Create</span>
        </Button>
      ),
    })

    return clearMobileHeader
  }, [clearMobileHeader, setMobileHeader])

  const clearSelectedShipment = () => {
    setSelectedShipmentId(undefined)
  }

  return (
    <main className="h-svh overflow-hidden bg-slate-50 md:p-4 dark:bg-slate-950">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col overflow-hidden border bg-background shadow-sm md:rounded-2xl">
        <div className="space-y-3 px-3 md:px-4 md:py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="hidden items-center gap-3 md:flex">
            <h1 className="text-xl font-semibold tracking-tight">Assignments</h1>
            <Button
              type="button"
              aria-label="Create assignment"
              onClick={() => setIsCreateOpen(true)}
              className="ml-auto"
            >
              <Plus size={24} color="#fff" aria-hidden="true" />
              <span>Create</span>
            </Button>
          </div>
        </div>
        <div className="grid min-h-0 flex-1 px-1 grid-cols-1 overflow-hidden md:grid-cols-[320px_minmax(320px,440px)_minmax(0,1fr)] md:rounded-2xl">
          <aside className="flex min-h-0 flex-col border-b bg-white md:border-r md:border-b-0 dark:bg-slate-950 px-2">
            <div className="min-h-0 flex-1 overflow-auto dark:bg-slate-900/40">
              <SearchInput
                aria-label="Search assignments"
                placeholder="Search assignment…"
                value={search}
                onChange={setSearch}
                clearLabel="Clear assignment search"
                className="py-3 sm:py-2.5"
              />
              <h3 className="text-sm font-semibold py-2">{`All assignments`}</h3>
              {ASSIGNMENT_STATUSES.map((status) => (
                <AssignmentGroup
                  key={status}
                  status={status}
                  search={debouncedSearch}
                  selectedId={selectedAssignmentId}
                  onSelect={(id) => {
                    setSelectedAssignmentId(id)
                    setSelectedShipmentId(undefined)
                  }}
                />
              ))}
            </div>
          </aside>

          <AssignmentDetailPanel
            assignmentId={selectedAssignmentId}
            selectedShipmentId={selectedShipmentId}
            onSelectShipment={setSelectedShipmentId}
            onDeleted={() => {
              setSelectedAssignmentId(undefined)
              setSelectedShipmentId(undefined)
            }}
          />

          <section className="hidden min-h-0 overflow-hidden border-l md:block">
            <ShipmentDetailPanel
              shipmentId={selectedShipmentId}
              shipments={selectedAssignmentShipments}
              onDeleted={clearSelectedShipment}
              className="h-full"
            />
          </section>
        </div>
      </div>

      {isCreateOpen && (
        <CreateAssignmentDialog
          onClose={() => setIsCreateOpen(false)}
          onCreated={(assignment) => setSelectedAssignmentId(assignment.id)}
        />
      )}

      <Sheet
        open={Boolean(showMobileShipmentSheet)}
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

import { useEffect, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { AssignmentDetailPanel } from '@/features/assignment/components/assignment-detail-panel'
import { AssignmentGroup } from '@/features/assignment/components/assignment-group'
import { ASSIGNMENT_STATUSES } from '@/features/assignment/components/assignment-status-styles'
import { CreateAssignmentDialog } from '@/features/assignment/components/create-assignment-dialog'
import { ShipmentDetailPanel } from '@/features/shipment/components/shipment-detail-panel'
import type { Shipment } from '@/features/shipment/types/shipment'
import { useUIStore } from '@/store/use-ui-store'

export function AssignmentPage() {
  const [search, setSearch] = useState('')
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | undefined>()
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | undefined>()
  const [selectedAssignmentShipments, setSelectedAssignmentShipments] = useState<Shipment[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 300)
  const setMobileHeader = useUIStore((state) => state.setMobileHeader)
  const clearMobileHeader = useUIStore((state) => state.clearMobileHeader)

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
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[320px_minmax(320px,440px)_minmax(0,1fr)] md:rounded-2xl">
          <aside className="flex min-h-0 flex-col border-b bg-white md:border-r md:border-b-0 dark:bg-slate-950 px-2">
            <div className="min-h-0 flex-1 overflow-auto dark:bg-slate-900/40">
              <div className="relative py-3 sm:py-2.5">
                <Search
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  aria-label="Search assignments"
                  placeholder="Search assignment…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-11 pr-9 pl-9 dark:bg-slate-900 rounded-xl"
                />
                {search && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Clear assignment search"
                    onClick={() => setSearch('')}
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full"
                  >
                    <X aria-hidden="true" />
                  </Button>
                )}
              </div>
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
                    setSelectedAssignmentShipments([])
                  }}
                />
              ))}
            </div>
          </aside>

          <AssignmentDetailPanel
            assignmentId={selectedAssignmentId}
            selectedShipmentId={selectedShipmentId}
            onSelectShipment={(id, shipments) => {
              setSelectedShipmentId(id)
              setSelectedAssignmentShipments(shipments)
            }}
            onDeleted={() => {
              setSelectedAssignmentId(undefined)
              setSelectedShipmentId(undefined)
              setSelectedAssignmentShipments([])
            }}
          />

          <section className="hidden min-h-0 overflow-hidden border-l md:block">
            <ShipmentDetailPanel
              shipmentId={selectedShipmentId}
              shipments={selectedAssignmentShipments}
              onDeleted={() => {
                setSelectedShipmentId(undefined)
                setSelectedAssignmentShipments([])
              }}
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
    </main>
  )
}

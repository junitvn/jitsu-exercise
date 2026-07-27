import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShipmentListPanel } from '@/features/shipment/components/shipment-list-panel'
import { ShipmentDetailPanel } from '@/features/shipment/components/shipment-detail-panel'
import { CreateShipmentDialog } from '@/features/shipment/components/create-shipment-dialog'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useUIStore } from '@/store/use-ui-store'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

/**
 * Shipment management page: a list panel (left) and a detail/edit panel (right).
 * Selection is simple local state -- it's only needed by these two panels, so
 * there's no need for a global store here.
 */
export function ShipmentPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState<ShipmentStatus | undefined>(undefined)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const setMobileHeader = useUIStore((state) => state.setMobileHeader)
  const clearMobileHeader = useUIStore((state) => state.clearMobileHeader)
  const showMobileSheet = isMobile && selectedId

  useEffect(() => {
    setMobileHeader({
      title: 'Shipments',
      action: (
        <Button
          type="button"
          aria-label="Create shipment"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={24} color="#fff" />
          <span>Create</span>
        </Button>
      ),
    })

    return clearMobileHeader
  }, [clearMobileHeader, setMobileHeader])

  const selectShipment = (id: string, status: ShipmentStatus) => {
    setSelectedId(id)
    setSelectedStatus(status)
  }

  const clearSelectedShipment = () => {
    setSelectedId(undefined)
    setSelectedStatus(undefined)
  }

  return (
    <main className="h-svh overflow-hidden bg-slate-50 md:p-4 dark:bg-slate-950">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col overflow-hidden border bg-background shadow-sm md:rounded-2xl">
        <header className="hidden items-center gap-3 border-b px-3 py-3 md:flex md:px-4 md:py-4">
          <h1 className="text-xl font-semibold tracking-tight">Shipments</h1>
          <Button
            type="button"
            aria-label="Create shipment"
            onClick={() => setIsCreateOpen(true)}
            className="ml-auto"
          >
            <Plus size={24} color="#fff" />
            <span>Create</span>
          </Button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[minmax(320px,350px)_minmax(0,1fr)]">
          <ShipmentListPanel
            selectedId={selectedId}
            selectedStatus={selectedStatus}
            onSelect={selectShipment}
          />
          <section className="hidden min-h-0 overflow-hidden md:block">
            <ShipmentDetailPanel
              shipmentId={selectedId}
              onDeleted={clearSelectedShipment}
              className="h-full"
            />
          </section>
        </div>
      </div>

      {showMobileSheet && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shipment details"
          className="fixed inset-0 z-50 md:hidden"
        >
          <button
            type="button"
            aria-label="Close shipment details"
            onClick={clearSelectedShipment}
            className="absolute inset-0 bg-black/35"
          />
          <div className="absolute inset-x-0 bottom-0 overflow-hidden rounded-t-2xl border bg-background shadow-2xl">
            <ShipmentDetailPanel
              shipmentId={selectedId}
              onClose={clearSelectedShipment}
              onDeleted={clearSelectedShipment}
              className="max-h-[85svh]"
            />
          </div>
        </div>
      )}

      {isCreateOpen && (
        <CreateShipmentDialog
          onClose={() => setIsCreateOpen(false)}
          onCreated={(shipment) => selectShipment(shipment.id, shipment.status)}
        />
      )}
    </main>
  )
}

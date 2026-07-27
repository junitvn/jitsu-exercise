import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ShipmentListPanel } from '@/features/shipment/components/shipment-list-panel'
import { ShipmentDetailPanel } from '@/features/shipment/components/shipment-detail-panel'
import { CreateShipmentDialog } from '@/features/shipment/components/create-shipment-dialog'
import { useShipment } from '@/features/shipment/hooks/use-shipment'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useUIStore } from '@/store/use-ui-store'
import { DESKTOP_PANEL_WIDTH_STYLE } from '@/utils/constants'

/**
 * Shipment management page: a list panel (left) and a detail/edit panel (right).
 * Selection is simple local state -- it's only needed by these two panels, so
 * there's no need for a global store here.
 */
export function ShipmentPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data: selectedShipment } = useShipment(selectedId)
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
          size='sm'
          aria-label="Create shipment"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={14} color="#fff" />
          <span>Create</span>
        </Button>
      ),
    })

    return clearMobileHeader
  }, [clearMobileHeader, setMobileHeader])

  const selectShipment = (id: string) => {
    setSelectedId(id)
  }

  const clearSelectedShipment = () => {
    setSelectedId(undefined)
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

        <div
          className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[var(--desktop-panel-width)_minmax(0,1fr)]"
          style={DESKTOP_PANEL_WIDTH_STYLE}
        >
          <ShipmentListPanel
            selectedId={selectedId}
            selectedStatus={selectedShipment?.status}
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

      <Sheet open={Boolean(showMobileSheet)} onOpenChange={(open) => !open && clearSelectedShipment()}>
        <SheetContent side="bottom" aria-label="Shipment details" className="md:hidden">
          <ShipmentDetailPanel
            shipmentId={selectedId}
            onClose={clearSelectedShipment}
            onDeleted={clearSelectedShipment}
            className="max-h-[85svh]"
          />
        </SheetContent>
      </Sheet>

      {isCreateOpen && (
        <CreateShipmentDialog
          onClose={() => setIsCreateOpen(false)}
          onCreated={(shipment) => selectShipment(shipment.id)}
        />
      )}
    </main>
  )
}

import { useQuery } from '@tanstack/react-query'
import { fetchShipmentById } from '@/features/shipment/api/shipment.api'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'

// Fetches a single shipment for the detail panel. Disabled until an id is selected.
export function useShipment(id: string | undefined) {
  return useQuery({
    queryKey: shipmentQueryKeys.detail(id ?? ''),
    queryFn: () => fetchShipmentById(id as string),
    enabled: Boolean(id),
  })
}

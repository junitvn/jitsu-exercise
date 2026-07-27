import { useQuery } from '@tanstack/react-query'
import { fetchShipmentById } from '@/features/shipment/api/shipment.api'

// Fetches a single shipment for the detail panel. Disabled until an id is selected.
export function useShipment(id: string | undefined) {
  return useQuery({
    queryKey: ['shipment', id],
    queryFn: () => fetchShipmentById(id as string),
    enabled: Boolean(id),
  })
}

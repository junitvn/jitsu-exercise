import { useQueries } from '@tanstack/react-query'
import { fetchShipmentCount } from '@/features/shipment/api/shipment.api'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

export interface ShipmentCountRequest {
  key: string
  status?: ShipmentStatus
  search?: string
  assignmentId?: string
}

export function useShipmentCounts(requests: ShipmentCountRequest[]): Map<string, number | undefined> {
  const results = useQueries({
    queries: requests.map((request) => ({
      queryKey: shipmentQueryKeys.count(request.status, request.search ?? '', request.assignmentId),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchShipmentCount({
          status: request.status,
          search: request.search,
          assignmentId: request.assignmentId,
          signal,
        }),
      staleTime: 30_000,
    })),
  })

  const counts = new Map<string, number | undefined>()
  requests.forEach((request, index) => {
    counts.set(request.key, results[index]?.data)
  })
  return counts
}

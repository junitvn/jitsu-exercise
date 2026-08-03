import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchShipments } from '@/features/shipment/api/shipment.api'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

export function useAssignmentShipmentsInfinite(
  assignmentId: string | undefined,
  status: ShipmentStatus | undefined,
) {
  return useInfiniteQuery({
    queryKey: shipmentQueryKeys.assignmentPagedList(assignmentId ?? '', status),
    queryFn: ({ pageParam, signal }) =>
      fetchShipments({ status, assignmentId: assignmentId as string, page: pageParam, signal }),
    initialPageParam: 1,
    enabled: Boolean(assignmentId),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.items.length === 0) return undefined
      const fetchedSoFar = allPages.reduce((sum, page) => sum + page.items.length, 0)
      if (lastPage.totalCount !== undefined && fetchedSoFar >= lastPage.totalCount) {
        return undefined
      }
      return allPages.length + 1
    },
  })
}

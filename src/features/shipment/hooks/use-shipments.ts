import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchShipments } from '@/features/shipment/api/shipment.api'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'
import type { ShipmentStatus } from '@/features/shipment/types/shipment'

// One infinite query per status group, so the left panel can page/scroll each
// group (OPEN / IN_TRANSIT / DELIVERED) independently. `search` is included in
// the query key so changing it starts a fresh paginated result set.
export function useShipments(status: ShipmentStatus, search: string) {
  return useInfiniteQuery({
    queryKey: shipmentQueryKeys.list(status, search),
    queryFn: ({ pageParam, signal }) => fetchShipments({ status, search, page: pageParam, signal }),
    initialPageParam: 1,
    // The API may not honor our requested page size, so decide there's a next
    // page by comparing how many rows we've fetched so far to `totalCount`,
    // rather than assuming each page is exactly SHIPMENTS_PAGE_SIZE long.
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

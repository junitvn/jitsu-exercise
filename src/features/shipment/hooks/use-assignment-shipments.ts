import { useQuery } from '@tanstack/react-query'
import { fetchShipmentsByAssignment } from '@/features/shipment/api/shipment.api'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'

export function useAssignmentShipments(assignmentId: string | undefined) {
  return useQuery({
    queryKey: shipmentQueryKeys.assignmentList(assignmentId ?? ''),
    queryFn: () => fetchShipmentsByAssignment(assignmentId as string),
    enabled: Boolean(assignmentId),
  })
}

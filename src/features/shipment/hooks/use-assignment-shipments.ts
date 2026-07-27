import { useQuery } from '@tanstack/react-query'
import { fetchShipmentsByAssignment } from '@/features/shipment/api/shipment.api'

export function useAssignmentShipments(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ['assignment-shipments', assignmentId],
    queryFn: () => fetchShipmentsByAssignment(assignmentId as string),
    enabled: Boolean(assignmentId),
  })
}

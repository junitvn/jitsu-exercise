import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createShipment } from '@/features/shipment/api/shipment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'

export function useCreateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: assignmentQueryKeys.all })
    },
  })
}

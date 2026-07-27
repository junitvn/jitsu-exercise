import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteShipment } from '@/features/shipment/api/shipment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'

export function useDeleteShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteShipment,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: shipmentQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: shipmentQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: shipmentQueryKeys.assignmentLists() })
      queryClient.invalidateQueries({ queryKey: assignmentQueryKeys.all })
    },
  })
}

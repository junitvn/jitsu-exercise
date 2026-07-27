import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateShipment } from '@/features/shipment/api/shipment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'
import type { Shipment } from '@/features/shipment/types/shipment'

// Saves an edited shipment, then refreshes the detail query and every shipment
// list query so the change (and any status/date change) is reflected everywhere.
export function useUpdateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateShipment,
    onSuccess: (saved: Shipment) => {
      queryClient.setQueryData(shipmentQueryKeys.detail(saved.id), saved)
      queryClient.invalidateQueries({ queryKey: shipmentQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: shipmentQueryKeys.assignmentLists() })
      queryClient.invalidateQueries({ queryKey: assignmentQueryKeys.all })
    },
  })
}

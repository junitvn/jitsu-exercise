import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateShipment } from '@/features/shipment/api/shipment.api'
import type { Shipment } from '@/features/shipment/types/shipment'

// Saves an edited shipment, then refreshes the detail query and every shipment
// list query so the change (and any status/date change) is reflected everywhere.
export function useUpdateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateShipment,
    onSuccess: (saved: Shipment) => {
      queryClient.setQueryData(['shipment', saved.id], saved)
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      queryClient.invalidateQueries({ queryKey: ['assignment-shipments'] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

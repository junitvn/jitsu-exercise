import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createShipment } from '@/features/shipment/api/shipment.api'

export function useCreateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
    },
  })
}

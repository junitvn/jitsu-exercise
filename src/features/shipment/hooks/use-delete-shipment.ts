import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteShipment } from '@/features/shipment/api/shipment.api'

export function useDeleteShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteShipment,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['shipment', id] })
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      queryClient.invalidateQueries({ queryKey: ['assignment-shipments'] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

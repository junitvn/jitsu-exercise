import { createShipment } from '@/features/shipment/api/shipment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'
import { createUseCreateMutation } from '@/lib/query-factory'

export const useCreateShipment = createUseCreateMutation({
  createFn: createShipment,
  invalidateKeys: [shipmentQueryKeys.all, assignmentQueryKeys.all],
})

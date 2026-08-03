import { deleteShipment } from '@/features/shipment/api/shipment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'
import { createUseDeleteMutation } from '@/lib/query-factory'

export const useDeleteShipment = createUseDeleteMutation({
  deleteFn: deleteShipment,
  detailKey: shipmentQueryKeys.detail,
  invalidateKeys: [shipmentQueryKeys.all, shipmentQueryKeys.assignmentLists(), assignmentQueryKeys.all],
})

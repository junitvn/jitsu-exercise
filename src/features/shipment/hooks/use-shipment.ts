import { fetchShipmentById } from '@/features/shipment/api/shipment.api'
import { shipmentQueryKeys } from '@/features/shipment/lib/shipment-query-keys'
import { createUseDetailQuery } from '@/lib/query-factory'

export const useShipment = createUseDetailQuery(shipmentQueryKeys.detail, fetchShipmentById)

import type { ShipmentStatus } from '@/features/shipment/types/shipment'

export const shipmentQueryKeys = {
  all: ['shipments'] as const,
  lists: () => [...shipmentQueryKeys.all, 'list'] as const,
  list: (status: ShipmentStatus, search: string) =>
    [...shipmentQueryKeys.lists(), status, search] as const,
  details: () => ['shipment'] as const,
  detail: (id: string) => [...shipmentQueryKeys.details(), id] as const,
  assignmentLists: () => ['assignment-shipments'] as const,
  assignmentList: (assignmentId: string) =>
    [...shipmentQueryKeys.assignmentLists(), assignmentId] as const,
}

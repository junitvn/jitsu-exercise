import { apiClient } from '@/api/client'
import { fetchAssignmentById, updateAssignment } from '@/features/assignment/api/assignment.api'
import type { Shipment, ShipmentCreateInput, ShipmentStatus } from '@/features/shipment/types/shipment'
export const SHIPMENTS_PAGE_SIZE = 50

export interface ShipmentsPage {
  items: Shipment[]
  totalCount: number | undefined
}

interface FetchShipmentsParams {
  status?: ShipmentStatus
  search?: string
  assignmentId?: string
  page: number
  signal?: AbortSignal
}

export async function fetchShipments({
  status,
  search,
  assignmentId,
  page,
  signal,
}: FetchShipmentsParams): Promise<ShipmentsPage> {
  const response = await apiClient.get<Shipment[]>('/shipments', {
    signal,
    params: {
      status,
      assignment_id: assignmentId,
      q: search || undefined,
      _page: page,
      _per_page: SHIPMENTS_PAGE_SIZE,
    },
  })

  const totalCountHeader = response.headers['x-total-count']

  return {
    items: response.data,
    totalCount: totalCountHeader ? Number(totalCountHeader) : undefined,
  }
}

interface FetchShipmentCountParams {
  status?: ShipmentStatus
  search?: string
  assignmentId?: string
  signal?: AbortSignal
}

export async function fetchShipmentCount({
  status,
  search,
  assignmentId,
  signal,
}: FetchShipmentCountParams): Promise<number> {
  const response = await apiClient.get<Shipment[]>('/shipments', {
    signal,
    params: {
      status,
      assignment_id: assignmentId,
      q: search || undefined,
      _page: 1,
      _per_page: 1,
    },
  })

  const totalCountHeader = response.headers['x-total-count']
  return totalCountHeader ? Number(totalCountHeader) : response.data.length
}

export async function fetchShipmentById(id: string): Promise<Shipment> {
  const response = await apiClient.get<Shipment>(`/shipments/${id}`)
  return response.data
}

export async function updateShipment(shipment: Shipment): Promise<Shipment> {
  const existingShipment = await fetchShipmentById(shipment.id)
  const response = await apiClient.put<Shipment>(`/shipments/${shipment.id}`, shipment)

  if (existingShipment.assignment_id !== response.data.assignment_id) {
    await syncAssignmentShipmentCounts([existingShipment.assignment_id, response.data.assignment_id])
  }

  return response.data
}

export async function createShipment(shipment: ShipmentCreateInput): Promise<Shipment> {
  const response = await apiClient.post<Shipment>('/shipments', shipment)

  if (response.data.assignment_id) {
    await syncAssignmentShipmentCounts([response.data.assignment_id])
  }

  return response.data
}

export async function deleteShipment(id: string): Promise<void> {
  const existingShipment = await fetchShipmentById(id)
  await apiClient.delete(`/shipments/${id}`)
  await syncAssignmentShipmentCounts([existingShipment.assignment_id])
}

export async function fetchShipmentsByAssignment(assignmentId: string): Promise<Shipment[]> {
  const response = await apiClient.get<Shipment[]>('/shipments', {
    params: { assignment_id: assignmentId },
  })
  return response.data
}

export async function fetchStatuses(): Promise<ShipmentStatus[]> {
  const response = await apiClient.get<{ id: ShipmentStatus }[]>('/statuses')
  return response.data.map((status) => status.id)
}

async function syncAssignmentShipmentCounts(assignmentIds: Array<string | null | undefined>) {
  const uniqueAssignmentIds = [...new Set(assignmentIds.filter((id): id is string => Boolean(id)))]

  await Promise.all(uniqueAssignmentIds.map(syncAssignmentShipmentCount))
}

async function syncAssignmentShipmentCount(assignmentId: string) {
  const [assignment, shipmentCount] = await Promise.all([
    fetchAssignmentById(assignmentId),
    fetchShipmentCount({ assignmentId }),
  ])

  if (assignment.shipment_count === shipmentCount) return

  await updateAssignment({
    ...assignment,
    shipment_count: shipmentCount,
  })
}

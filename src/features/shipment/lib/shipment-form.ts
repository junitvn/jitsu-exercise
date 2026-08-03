import type { Shipment, ShipmentStatus } from '@/features/shipment/types/shipment'

export interface AssignmentFieldState {
  needsAssignment: boolean
  isAssignmentSelectDisabled: boolean
  showAssignmentDescription: boolean
}

export function getAssignmentFieldState(
  currentStatus: ShipmentStatus,
  targetStatus: ShipmentStatus,
): AssignmentFieldState {
  const needsAssignment = currentStatus === 'OPEN' && targetStatus === 'IN_TRANSIT'
  const isAssignmentSelectDisabled =
    targetStatus === 'OPEN' || (!needsAssignment && currentStatus !== 'IN_TRANSIT')
  const showAssignmentDescription =
    targetStatus !== 'OPEN' &&
    targetStatus !== 'DELIVERED' &&
    !needsAssignment &&
    currentStatus !== 'IN_TRANSIT'

  return { needsAssignment, isAssignmentSelectDisabled, showAssignmentDescription }
}

export function getTransitionErrorField(
  shipment: Shipment,
  targetStatus: ShipmentStatus,
  nextAssignmentId: string | null,
): 'assignment_id' | 'status' {
  return shipment.status === 'OPEN' && targetStatus === 'IN_TRANSIT' && !nextAssignmentId
    ? 'assignment_id'
    : 'status'
}

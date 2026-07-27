import type { Shipment, ShipmentStatus } from '@/features/shipment/types/shipment'

const VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  OPEN: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED', 'OPEN'],
  DELIVERED: [],
}

export function getValidTargetStatuses(status: ShipmentStatus): ShipmentStatus[] {
  return VALID_TRANSITIONS[status]
}

export function canTransitionShipment(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return from === to || VALID_TRANSITIONS[from].includes(to)
}

export function getTransitionError(
  shipment: Shipment,
  nextStatus: ShipmentStatus,
  assignmentId?: string | null,
): string | null {
  if (!canTransitionShipment(shipment.status, nextStatus)) {
    return `${shipment.status} cannot transition to ${nextStatus}.`
  }

  if (nextStatus === 'IN_TRANSIT' && !assignmentId) {
    return 'Select an assignment before moving a shipment into transit.'
  }

  if (nextStatus === 'DELIVERED' && !assignmentId) {
    return 'A delivered shipment must keep its assignment.'
  }

  return null
}

export function applyShipmentTransition(
  shipment: Shipment,
  nextStatus: ShipmentStatus,
  assignmentId?: string | null,
): Shipment {
  const nextAssignmentId = nextStatus === 'OPEN' ? null : assignmentId ?? shipment.assignment_id
  const transitionError = getTransitionError(shipment, nextStatus, nextAssignmentId)

  if (transitionError) {
    throw new Error(transitionError)
  }

  if (nextStatus === 'OPEN') {
    return { ...shipment, status: nextStatus, assignment_id: null }
  }

  return { ...shipment, status: nextStatus, assignment_id: nextAssignmentId }
}

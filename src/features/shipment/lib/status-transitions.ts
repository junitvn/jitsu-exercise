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

  if (shipment.status === 'OPEN' && nextStatus === 'IN_TRANSIT' && !assignmentId) {
    return 'Select an assignment before moving an open shipment into transit.'
  }

  return null
}

export function applyShipmentTransition(
  shipment: Shipment,
  nextStatus: ShipmentStatus,
  assignmentId?: string | null,
): Shipment {
  const transitionError = getTransitionError(shipment, nextStatus, assignmentId)

  if (transitionError) {
    throw new Error(transitionError)
  }

  if (shipment.status === 'IN_TRANSIT' && nextStatus === 'OPEN') {
    return { ...shipment, status: nextStatus, assignment_id: null }
  }

  if (shipment.status === 'OPEN' && nextStatus === 'IN_TRANSIT') {
    return { ...shipment, status: nextStatus, assignment_id: assignmentId }
  }

  return { ...shipment, status: nextStatus, assignment_id: assignmentId ?? null }
}

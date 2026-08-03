import { describe, expect, it } from 'vitest'
import { getAssignmentFieldState, getTransitionErrorField } from '@/features/shipment/lib/shipment-form'
import type { Shipment } from '@/features/shipment/types/shipment'

const shipment: Shipment = {
  id: 'shp_001',
  client_name: 'Sony',
  label: 'LAX-581-250521-1',
  status: 'OPEN',
  arrival_date: '2026-07-25T00:00:00.000Z',
  delivery_by_date: '2026-07-26T00:00:00.000Z',
  eta: '2026-07-26T00:00:00.000Z',
  warehouse_id: '581',
  assignment_id: null,
  lat: 32.7,
  lng: -96.8,
}

describe('getAssignmentFieldState', () => {
  it('requires an assignment when moving an open shipment into transit', () => {
    expect(getAssignmentFieldState('OPEN', 'IN_TRANSIT')).toEqual({
      needsAssignment: true,
      isAssignmentSelectDisabled: false,
      showAssignmentDescription: false,
    })
  })

  it('disables the assignment select and shows the hint while staying open', () => {
    expect(getAssignmentFieldState('OPEN', 'OPEN')).toEqual({
      needsAssignment: false,
      isAssignmentSelectDisabled: true,
      showAssignmentDescription: false,
    })
  })

  it('keeps the assignment select enabled while the shipment is already in transit', () => {
    expect(getAssignmentFieldState('IN_TRANSIT', 'IN_TRANSIT')).toEqual({
      needsAssignment: false,
      isAssignmentSelectDisabled: false,
      showAssignmentDescription: false,
    })
  })

  it('keeps the assignment select enabled when moving in-transit to delivered', () => {
    expect(getAssignmentFieldState('IN_TRANSIT', 'DELIVERED')).toEqual({
      needsAssignment: false,
      isAssignmentSelectDisabled: false,
      showAssignmentDescription: false,
    })
  })
})

describe('getTransitionErrorField', () => {
  it('attaches the error to the assignment field when transit requires one', () => {
    expect(getTransitionErrorField(shipment, 'IN_TRANSIT', null)).toBe('assignment_id')
  })

  it('attaches the error to the status field for any other invalid transition', () => {
    expect(getTransitionErrorField(shipment, 'DELIVERED', null)).toBe('status')
    expect(getTransitionErrorField({ ...shipment, status: 'IN_TRANSIT' }, 'DELIVERED', null)).toBe('status')
  })
})

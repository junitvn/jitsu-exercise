import { describe, expect, it } from 'vitest'
import {
  applyShipmentTransition,
  canTransitionShipment,
  getValidTargetStatuses,
} from '@/features/shipment/lib/status-transitions'
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

describe('shipment status transitions', () => {
  it('returns only valid target statuses', () => {
    expect(getValidTargetStatuses('OPEN')).toEqual(['IN_TRANSIT'])
    expect(getValidTargetStatuses('IN_TRANSIT')).toEqual(['DELIVERED', 'OPEN'])
    expect(getValidTargetStatuses('DELIVERED')).toEqual([])
  })

  it('prevents invalid transitions', () => {
    expect(canTransitionShipment('OPEN', 'DELIVERED')).toBe(false)
    expect(() => applyShipmentTransition(shipment, 'DELIVERED')).toThrow(
      'OPEN cannot transition to DELIVERED.',
    )
  })

  it('requires an assignment when moving open shipments into transit', () => {
    expect(() => applyShipmentTransition(shipment, 'IN_TRANSIT')).toThrow(
      'Select an assignment before moving an open shipment into transit.',
    )

    expect(applyShipmentTransition(shipment, 'IN_TRANSIT', 'asg_001')).toMatchObject({
      status: 'IN_TRANSIT',
      assignment_id: 'asg_001',
    })
  })

  it('clears assignment when moving an in-transit shipment back to open', () => {
    expect(
      applyShipmentTransition(
        { ...shipment, status: 'IN_TRANSIT', assignment_id: 'asg_001' },
        'OPEN',
      ),
    ).toMatchObject({
      status: 'OPEN',
      assignment_id: null,
    })
  })
})

import { describe, expect, it } from 'vitest'
import {
  getPointDistance,
  getShipmentPointsSignature,
  getShortestShipmentOrder,
  getStatusOrderedShipmentRoute,
} from '@/features/shipment/lib/shipment-route'
import type { ShipmentPoint } from '@/features/shipment/lib/shipment-route'

const point = (id: string, lat: number, lng: number, status: ShipmentPoint['status'] = 'OPEN'): ShipmentPoint => ({
  id,
  lat,
  lng,
  status,
})

describe('shipment route ordering', () => {
  it('returns points unchanged when there are fewer than 3', () => {
    const points = [point('a', 0, 0), point('b', 1, 1)]
    expect(getShortestShipmentOrder(points)).toEqual(points)
  })

  it('orders points by nearest neighbor starting from the first point', () => {
    // a --- b ------- c
    // 0     1         5   (lng)
    const a = point('a', 0, 0)
    const b = point('b', 0, 1)
    const c = point('c', 0, 5)

    // Starting from `a`, the nearest unvisited point is `b`, then `c`.
    expect(getShortestShipmentOrder([a, c, b]).map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })

  it('groups the route by status (OPEN, then IN_TRANSIT, then DELIVERED)', () => {
    const points = [
      point('delivered-1', 0, 0, 'DELIVERED'),
      point('open-1', 0, 1, 'OPEN'),
      point('transit-1', 0, 2, 'IN_TRANSIT'),
    ]

    expect(getStatusOrderedShipmentRoute(points).map((p) => p.id)).toEqual([
      'open-1',
      'transit-1',
      'delivered-1',
    ])
  })

  it('produces a stable, order-sensitive signature for memoization', () => {
    const points = [point('a', 0, 0), point('b', 1, 1)]
    const signature = getShipmentPointsSignature(points)

    expect(signature).toBe('a:0,0:OPEN|b:1,1:OPEN')
    expect(getShipmentPointsSignature([...points])).toBe(signature)
    expect(getShipmentPointsSignature([{ ...points[0], lat: 2 }, points[1]])).not.toBe(signature)
  })

  it('computes zero distance for identical points', () => {
    const a = point('a', 32.7, -96.8)
    expect(getPointDistance(a, a)).toBe(0)
  })
})

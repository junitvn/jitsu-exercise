import type { ShipmentStatus } from '@/features/shipment/types/shipment'

export interface ShipmentPoint {
  id: string
  lat: number
  lng: number
  status: ShipmentStatus
}

const SHIPMENT_STATUS_ORDER: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED']

export function getShipmentPointsSignature(points: ShipmentPoint[]): string {
  return points.map((point) => `${point.id}:${point.lat},${point.lng}:${point.status}`).join('|')
}

export function getStatusOrderedShipmentRoute(points: ShipmentPoint[]): ShipmentPoint[] {
  return SHIPMENT_STATUS_ORDER.flatMap((status) =>
    getShortestShipmentOrder(points.filter((point) => point.status === status)),
  )
}

export function getShortestShipmentOrder(points: ShipmentPoint[]): ShipmentPoint[] {
  if (points.length < 3) {
    return points
  }

  return buildNearestNeighborRoute(points, 0)
}

function buildNearestNeighborRoute(points: ShipmentPoint[], startIndex: number): ShipmentPoint[] {
  const remaining = points.filter((_, index) => index !== startIndex)
  const route = [points[startIndex]]

  while (remaining.length > 0) {
    const current = route[route.length - 1]
    let nearestIndex = 0
    let nearestDistance = getPointDistance(current, remaining[0])

    for (let index = 1; index < remaining.length; index += 1) {
      const distance = getPointDistance(current, remaining[index])

      if (distance < nearestDistance) {
        nearestIndex = index
        nearestDistance = distance
      }
    }

    route.push(remaining.splice(nearestIndex, 1)[0])
  }

  return route
}

export function getPointDistance(pointA: ShipmentPoint, pointB: ShipmentPoint): number {
  const latA = toRadians(pointA.lat)
  const latB = toRadians(pointB.lat)
  const deltaLat = toRadians(pointB.lat - pointA.lat)
  const deltaLng = toRadians(pointB.lng - pointA.lng)
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLng / 2) ** 2

  return 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

import { useEffect, useMemo } from 'react'
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import * as L from 'leaflet'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import { cn } from '@/lib/utils'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import type { Shipment, ShipmentStatus } from '@/features/shipment/types/shipment'

interface ShipmentMapProps {
  shipments: Shipment[]
  selectedShipmentId?: string
  className?: string
  connectPins?: boolean
  onSelectShipment?: (id: string) => void
}

type ShipmentPoint = {
  id: string
  lat: number
  lng: number
  status: ShipmentStatus
}

const SHIPMENT_STATUS_ORDER: ShipmentStatus[] = ['OPEN', 'IN_TRANSIT', 'DELIVERED']

function getMarkerIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<span class="block size-4 rounded-full border-2 border-white shadow" style="background-color: ${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

export function ShipmentMap({
  shipments,
  selectedShipmentId,
  className,
  connectPins = false,
  onSelectShipment,
}: ShipmentMapProps) {
  const mappableShipments = useMemo(
    () => shipments.filter((shipment) => Number.isFinite(shipment.lat) && Number.isFinite(shipment.lng)),
    [shipments],
  )
  const selectedShipment =
    mappableShipments.find((shipment) => shipment.id === selectedShipmentId)
  const initialShipment = selectedShipment ?? mappableShipments[0]
  const center: L.LatLngExpression = initialShipment
    ? [initialShipment.lat, initialShipment.lng]
    : [32.7767, -96.797]
  const routePoints = useMemo(
    () =>
      getStatusOrderedShipmentRoute(
        mappableShipments.map((shipment) => ({
          id: shipment.id,
          lat: shipment.lat,
          lng: shipment.lng,
          status: shipment.status,
        })),
      ),
    [mappableShipments],
  )

  return (
    <div className={cn('min-h-32 overflow-hidden rounded-lg border bg-muted', className)}>
      <MapContainer center={center} zoom={11} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport shipments={mappableShipments} selectedShipment={selectedShipment} />
        {connectPins && routePoints.length > 1 && <ShipmentRoute points={routePoints} />}
        {mappableShipments.map((shipment) => {
          const position: L.LatLngExpression = [shipment.lat, shipment.lng]
          const isSelected = shipment.id === selectedShipmentId
          const markerColor = SHIPMENT_STATUS_STYLES[shipment.status].markerColor

          return isSelected ? (
            <Marker
              key={shipment.id}
              position={position}
              icon={getMarkerIcon(markerColor)}
              eventHandlers={{
                click: () => onSelectShipment?.(shipment.id),
              }}
            >
              <Tooltip>{shipment.label}</Tooltip>
            </Marker>
          ) : (
            <CircleMarker
              key={shipment.id}
              center={position}
              radius={5}
              eventHandlers={{
                click: () => onSelectShipment?.(shipment.id),
              }}
              pathOptions={{ color: markerColor, fillColor: markerColor, fillOpacity: 0.7 }}
            >
              <Tooltip>{shipment.label}</Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}

function ShipmentRoute({ points }: { points: ShipmentPoint[] }) {
  const map = useMap()
  const waypointKey = points.map((point) => `${point.id}:${point.lat},${point.lng}`).join('|')

  useEffect(() => {
    const control = L.Routing.control({
      waypoints: points.map((point) => L.latLng(point.lat, point.lng)),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      show: false,
      showAlternatives: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: 'var(--primary)', opacity: 0.85, weight: 4 }],
      },
    } as L.Routing.RoutingControlOptions).addTo(map)

    return () => {
      map.removeControl(control)
    }
  }, [map, points, waypointKey])

  return null
}

function MapViewport({
  shipments,
  selectedShipment,
}: {
  shipments: Shipment[]
  selectedShipment: Shipment | undefined
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedShipment) {
      map.flyTo([selectedShipment.lat, selectedShipment.lng], 14, { animate: true })
    } else if (shipments.length > 1) {
      map.fitBounds(
        shipments.map((shipment) => [shipment.lat, shipment.lng] as L.LatLngTuple),
        { animate: true, padding: [24, 24] },
      )
    } else if (shipments[0]) {
      map.setView([shipments[0].lat, shipments[0].lng], 12, { animate: true })
    } else {
      map.setView([32.7767, -96.797], 10, { animate: true })
    }

    map.invalidateSize()

    const frameId = window.requestAnimationFrame(() => map.invalidateSize())
    const timeoutId = window.setTimeout(() => map.invalidateSize(), 250)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timeoutId)
    }
  }, [map, selectedShipment, shipments])

  return null
}

function getStatusOrderedShipmentRoute(points: ShipmentPoint[]) {
  return SHIPMENT_STATUS_ORDER.flatMap((status) =>
    getShortestShipmentOrder(points.filter((point) => point.status === status)),
  )
}

function getShortestShipmentOrder(points: ShipmentPoint[]) {
  if (points.length < 3) {
    return points
  }

  return points
    .map((_, index) => index)
    .map((startIndex) => buildNearestNeighborRoute(points, startIndex))
    .sort((a, b) => getRouteDistance(a) - getRouteDistance(b))[0]
}

function buildNearestNeighborRoute(points: ShipmentPoint[], startIndex: number) {
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

function getRouteDistance(points: ShipmentPoint[]) {
  return points.reduce((total, point, index) => {
    const previousPoint = points[index - 1]

    return previousPoint ? total + getPointDistance(previousPoint, point) : total
  }, 0)
}

function getPointDistance(pointA: ShipmentPoint, pointB: ShipmentPoint) {
  const latA = toRadians(pointA.lat)
  const latB = toRadians(pointB.lat)
  const deltaLat = toRadians(pointB.lat - pointA.lat)
  const deltaLng = toRadians(pointB.lng - pointA.lng)
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLng / 2) ** 2

  return 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

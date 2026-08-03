import { useEffect, useMemo } from 'react'
import { CircleMarker, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import * as L from 'leaflet'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import { cn } from '@/lib/utils'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import {
  getShipmentPointsSignature,
  getStatusOrderedShipmentRoute,
} from '@/features/shipment/lib/shipment-route'
import type { ShipmentPoint } from '@/features/shipment/lib/shipment-route'
import type { Shipment } from '@/features/shipment/types/shipment'

interface ShipmentMapProps {
  shipments: Shipment[]
  selectedShipmentId?: string
  className?: string
  connectPins?: boolean
  onSelectShipment?: (id: string) => void
}

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
  const shipmentPoints: ShipmentPoint[] = useMemo(
    () =>
      mappableShipments.map((shipment) => ({
        id: shipment.id,
        lat: shipment.lat,
        lng: shipment.lng,
        status: shipment.status,
      })),
    [mappableShipments],
  )
  const routeSignature = getShipmentPointsSignature(shipmentPoints)
  const routePoints = useMemo(
    () => getStatusOrderedShipmentRoute(shipmentPoints),
    [routeSignature],
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

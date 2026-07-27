import 'leaflet'

declare module 'leaflet-routing-machine'

declare module 'leaflet' {
  namespace Routing {
    interface LineOptions {
      styles?: PathOptions[]
    }

    interface RoutingControlOptions extends ControlOptions {
      waypoints: LatLng[]
      routeWhileDragging?: boolean
      addWaypoints?: boolean
      draggableWaypoints?: boolean
      fitSelectedRoutes?: boolean
      show?: boolean
      showAlternatives?: boolean
      createMarker?: () => Marker | null
      lineOptions?: LineOptions
    }

    interface RoutingControl extends Control {}

    function control(options: RoutingControlOptions): RoutingControl
  }
}

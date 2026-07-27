// Status values as returned by GET /statuses.
export type ShipmentStatus = 'OPEN' | 'IN_TRANSIT' | 'DELIVERED'

// Shape of a single shipment record from the API.
export interface Shipment {
  id: string
  client_name: string
  label: string
  status: ShipmentStatus
  arrival_date: string // ISO date string
  delivery_by_date: string // ISO date string
  eta: string // ISO date string
  warehouse_id: string
  assignment_id?: string | null
  lat: number
  lng: number
}

// Fields the detail panel is allowed to edit.
export type ShipmentEditableFields = Pick<Shipment, 'delivery_by_date' | 'lat' | 'lng'>

export type ShipmentCreateInput = Omit<Shipment, 'id'>

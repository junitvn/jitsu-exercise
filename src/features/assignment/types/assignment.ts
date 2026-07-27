export type AssignmentStatus = 'OPEN' | 'COMPLETED'

export interface Assignment {
  id: string
  label: string
  status: AssignmentStatus
  clients: string[]
  shipment_count: number
}

import { z } from 'zod'

// Validation for the editable fields on the shipment detail panel.
// lat/lng are registered with `valueAsNumber: true` so RHF hands zod a number,
// not a string, keeping the field's input/output types identical.
export const shipmentEditSchema = z.object({
  delivery_by_date: z.string().min(1, 'Delivery date is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  status: z.enum(['OPEN', 'IN_TRANSIT', 'DELIVERED']),
  assignment_id: z.string().nullable(),
})

export type ShipmentEditValues = z.infer<typeof shipmentEditSchema>

export const shipmentCreateSchema = z.object({
  client_name: z.string().min(1, 'Client name is required'),
  label: z.string().min(1, 'Label is required'),
  delivery_by_date: z.string().min(1, 'Delivery date is required'),
  warehouse_id: z.string().min(1, 'Warehouse is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export type ShipmentCreateValues = z.infer<typeof shipmentCreateSchema>

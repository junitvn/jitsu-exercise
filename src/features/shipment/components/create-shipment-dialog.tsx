import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/utils/format-date'
import { shipmentCreateSchema, type ShipmentCreateValues } from '@/features/shipment/schemas/shipment.schema'
import { useCreateShipment } from '@/features/shipment/hooks/use-create-shipment'
import type { Shipment } from '@/features/shipment/types/shipment'

interface CreateShipmentDialogProps {
  onClose: () => void
  onCreated: (shipment: Shipment) => void
}

export function CreateShipmentDialog({ onClose, onCreated }: CreateShipmentDialogProps) {
  const createShipment = useCreateShipment()
  const defaultDeliveryDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 2)
    return toDatetimeLocalValue(date.toISOString())
  }, [])

  const form = useForm<ShipmentCreateValues>({
    resolver: zodResolver(shipmentCreateSchema),
    defaultValues: {
      client_name: '',
      label: '',
      delivery_by_date: defaultDeliveryDate,
      warehouse_id: '581',
      lat: 32.7767,
      lng: -96.797,
    },
  })

  const onSubmit = (values: ShipmentCreateValues) => {
    const now = new Date().toISOString()
    createShipment.mutate(
      {
        client_name: values.client_name,
        label: values.label,
        status: 'OPEN',
        arrival_date: now,
        delivery_by_date: fromDatetimeLocalValue(values.delivery_by_date),
        eta: fromDatetimeLocalValue(values.delivery_by_date),
        warehouse_id: values.warehouse_id,
        assignment_id: null,
        lat: values.lat,
        lng: values.lng,
      },
      {
        onSuccess: (shipment) => {
          onCreated(shipment)
          onClose()
        },
      },
    )
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Create shipment" className="fixed inset-0 z-[1100]">
      <button
        type="button"
        aria-label="Close create shipment"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="absolute top-1/2 left-1/2 flex w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border bg-background p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Create shipment</h2>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X aria-hidden="true" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldError label="Client" error={form.formState.errors.client_name?.message}>
            <Input id="new-client" {...form.register('client_name')} />
          </FieldError>
          <FieldError label="Label" error={form.formState.errors.label?.message}>
            <Input id="new-label" {...form.register('label')} />
          </FieldError>
          <FieldError label="Warehouse" error={form.formState.errors.warehouse_id?.message}>
            <Input id="new-warehouse" {...form.register('warehouse_id')} />
          </FieldError>
          <FieldError label="Delivery by date" error={form.formState.errors.delivery_by_date?.message}>
            <DateTimePicker
              id="new-delivery-date"
              value={form.watch('delivery_by_date')}
              onChange={(value) =>
                form.setValue('delivery_by_date', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </FieldError>
          <FieldError label="Latitude" error={form.formState.errors.lat?.message}>
            <Input id="new-lat" type="number" step="any" {...form.register('lat', { valueAsNumber: true })} />
          </FieldError>
          <FieldError label="Longitude" error={form.formState.errors.lng?.message}>
            <Input id="new-lng" type="number" step="any" {...form.register('lng', { valueAsNumber: true })} />
          </FieldError>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createShipment.isPending}>
            {createShipment.isPending ? 'Creating…' : 'Create'}
          </Button>
        </div>
        {createShipment.isError && (
          <p className="text-xs text-destructive">Failed to create shipment. Try again.</p>
        )}
      </form>
    </div>
  )
}

function FieldError({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

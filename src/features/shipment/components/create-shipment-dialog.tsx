import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label="Create shipment"
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Create shipment</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              htmlFor="new-client"
              label="Client"
              error={form.formState.errors.client_name?.message}
            >
              <Input id="new-client" {...form.register('client_name')} />
            </FormField>
            <FormField htmlFor="new-label" label="Label" error={form.formState.errors.label?.message}>
              <Input id="new-label" {...form.register('label')} />
            </FormField>
            <FormField
              htmlFor="new-warehouse"
              label="Warehouse"
              error={form.formState.errors.warehouse_id?.message}
            >
              <Input id="new-warehouse" {...form.register('warehouse_id')} />
            </FormField>
            <FormField
              htmlFor="new-delivery-date"
              label="Delivery by date"
              error={form.formState.errors.delivery_by_date?.message}
            >
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
            </FormField>
            <FormField htmlFor="new-lat" label="Latitude" error={form.formState.errors.lat?.message}>
              <Input id="new-lat" type="number" step="any" {...form.register('lat', { valueAsNumber: true })} />
            </FormField>
            <FormField htmlFor="new-lng" label="Longitude" error={form.formState.errors.lng?.message}>
              <Input id="new-lng" type="number" step="any" {...form.register('lng', { valueAsNumber: true })} />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createShipment.isPending}>
              {createShipment.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
          {createShipment.isError ? (
            <p className="text-xs text-destructive">Failed to create shipment. Try again.</p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  )
}

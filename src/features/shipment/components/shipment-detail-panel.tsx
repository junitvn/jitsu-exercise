import { lazy, Suspense, useEffect, useMemo } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AsyncState } from '@/components/ui/async-state'
import { Button } from '@/components/ui/button'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CopyableId } from '@/components/ui/copyable-id'
import { DetailField } from '@/components/ui/detail-field'
import { toast } from '@/components/ui/toast'
import { LabeledSelect } from '@/components/ui/labeled-select'
import { formatDate, toDatetimeLocalValue, fromDatetimeLocalValue } from '@/utils/format-date'
import { useAssignments } from '@/features/assignment/hooks/use-assignments'
import { useShipment } from '@/features/shipment/hooks/use-shipment'
import { useUpdateShipment } from '@/features/shipment/hooks/use-update-shipment'
import { useDeleteShipment } from '@/features/shipment/hooks/use-delete-shipment'
import { shipmentEditSchema, type ShipmentEditValues } from '@/features/shipment/schemas/shipment.schema'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import type { Shipment } from '@/features/shipment/types/shipment'
import {
  applyShipmentTransition,
  getTransitionError,
  getValidTargetStatuses,
} from '@/features/shipment/lib/status-transitions'
import { getAssignmentFieldState, getTransitionErrorField } from '@/features/shipment/lib/shipment-form'

// Leaflet + leaflet-routing-machine are heavy and only needed once a shipment
// is selected, so load them lazily instead of bundling them into the main chunk.
const ShipmentMap = lazy(() =>
  import('@/features/shipment/components/shipment-map').then((m) => ({ default: m.ShipmentMap })),
)

interface ShipmentDetailPanelProps {
  shipmentId: string | undefined
  shipments?: Shipment[]
  onClose?: () => void
  onDeleted?: () => void
  className?: string
}

export function ShipmentDetailPanel({
  shipmentId,
  shipments = [],
  onClose,
  onDeleted,
  className,
}: ShipmentDetailPanelProps) {
  const { data: shipment, isLoading, isError, refetch } = useShipment(shipmentId)
  const hasSelectedShipment = Boolean(shipmentId)
  const { data: assignments = [] } = useAssignments(undefined, '', hasSelectedShipment)
  const { data: openAssignments = [] } = useAssignments('OPEN', '', hasSelectedShipment)
  const updateShipment = useUpdateShipment()
  const deleteShipment = useDeleteShipment()

  const form = useForm<ShipmentEditValues>({
    resolver: zodResolver(shipmentEditSchema),
    defaultValues: {
      delivery_by_date: '',
      lat: 0,
      lng: 0,
      status: 'OPEN',
      assignment_id: null,
    },
  })

  useEffect(() => {
    if (!shipment) return
    form.reset({
      delivery_by_date: toDatetimeLocalValue(shipment.delivery_by_date),
      lat: shipment.lat,
      lng: shipment.lng,
      status: shipment.status,
      assignment_id: shipment.assignment_id ?? null,
    })
  }, [shipment, form])

  const watchedLat = form.watch('lat')
  const watchedLng = form.watch('lng')
  const debouncedLat = useDebouncedValue(watchedLat, 300)
  const debouncedLng = useDebouncedValue(watchedLng, 300)

  const editableMapShipment = useMemo(
    () => (shipment ? { ...shipment, lat: Number(debouncedLat), lng: Number(debouncedLng) } : undefined),
    [shipment, debouncedLat, debouncedLng],
  )
  const mapShipments = useMemo(() => {
    if (!shipment || !editableMapShipment) return []
    return shipments.length > 0
      ? shipments.map((mapShipment) => (mapShipment.id === shipment.id ? editableMapShipment : mapShipment))
      : [editableMapShipment]
  }, [shipments, shipment, editableMapShipment])

  if (!shipmentId) {
    return (
      <AsyncState
        variant="empty"
        icon={<Package aria-hidden="true" />}
        message="Select a shipment to view details"
      />
    )
  }

  if (isLoading) {
    return <AsyncState variant="loading" message="Loading..." />
  }

  if (isError || !shipment) {
    return (
      <AsyncState
        variant="error"
        message="Could not load shipment details."
        onRetry={() => refetch()}
      />
    )
  }

  const deliveryByDate = form.watch('delivery_by_date')
  const targetStatus = form.watch('status')
  const assignmentId = form.watch('assignment_id')
  const isDirty = form.formState.isDirty
  const headerStatus = form.formState.dirtyFields.status ? targetStatus : shipment.status
  const statusStyles = SHIPMENT_STATUS_STYLES[headerStatus]
  const validTargetStatuses = [shipment.status, ...getValidTargetStatuses(shipment.status)]
  const isStatusSelectDisabled = shipment.status === 'DELIVERED'
  const statusItems = validTargetStatuses.map((status) => ({
    label: SHIPMENT_STATUS_STYLES[status].label,
    value: status,
  }))
  const currentAssignment = assignments.find((assignment) => assignment.id === shipment.assignment_id)
  const hasCurrentOpenAssignment =
    Boolean(shipment.assignment_id) &&
    openAssignments.some((assignment) => assignment.id === shipment.assignment_id)
  const assignmentItems = [
    { label: 'Unassigned', value: '' },
    ...(!hasCurrentOpenAssignment && currentAssignment
      ? [{ label: currentAssignment.label, value: currentAssignment.id }]
      : []),
    ...openAssignments.map((assignment) => ({
      label: assignment.label,
      value: assignment.id,
    })),
  ]
  const { isAssignmentSelectDisabled, showAssignmentDescription } =
    getAssignmentFieldState(shipment.status, targetStatus)

  const onSubmit = (values: ShipmentEditValues) => {
    const nextAssignmentId = values.assignment_id || null
    const error = getTransitionError(shipment, values.status, nextAssignmentId)
    if (error) {
      form.setError(getTransitionErrorField(shipment, values.status, nextAssignmentId), {
        type: 'manual',
        message: error,
      })
      return
    }

    const transitionedShipment = applyShipmentTransition(shipment, values.status, nextAssignmentId)

    updateShipment.mutate({
      ...transitionedShipment,
      delivery_by_date: fromDatetimeLocalValue(values.delivery_by_date),
      lat: values.lat,
      lng: values.lng,
    }, {
      onSuccess: () => {
        toast.add({
          type: 'success',
          title: 'Saved',
          description: 'Shipment details were updated.',
        })
      },
      onError: () => {
        toast.add({
          type: 'error',
          title: 'Failed to save',
          description: 'Try again.',
        })
      },
    })
  }

  const onDelete = () => {
    deleteShipment.mutate(shipment.id, {
      onSuccess: () => {
        toast.add({
          type: 'success',
          title: 'Deleted',
          description: `${shipment.label} was deleted.`,
        })
        onDeleted?.()
        onClose?.()
      },
      onError: () => {
        toast.add({
          type: 'error',
          title: 'Failed to delete',
          description: 'Try again.',
        })
      },
    })
  }

  return (
    <div
      className={cn(
        'relative flex h-full min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain p-5 sm:px-4 sm:pt-2 md:overflow-hidden',
        className,
      )}
    >
      <div>
        <div className="flex flex-row justify-between items-center gap-2">
          <h2 className="text-2xl font-semibold">{shipment.client_name}</h2>
          <Badge
            variant="outline"
            className={statusStyles.badge}
            aria-label={`Shipment status: ${statusStyles.label}`}
          >
            <span className={cn('size-2.5 rounded-full', statusStyles.dot)} aria-hidden="true" />
            {statusStyles.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          <CopyableId label="shipment label" value={shipment.label} />
        </p>
      </div>

      {/* Read-only fields */}
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <DetailField
          label="Shipment ID"
          value={<CopyableId label="shipment ID" value={shipment.id} />}
        />
        <DetailField
          label="Assignment ID"
          value={<CopyableId label="assignment ID" value={shipment.assignment_id} />}
        />
        <DetailField label="Arrival date" value={formatDate(shipment.arrival_date)} />
        <DetailField
          label="Delivery by date"
          value={formatDate(shipment.delivery_by_date)}
        />
        <DetailField label="Warehouse ID" value={shipment.warehouse_id} />
      </dl>

      {/* Editable fields */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            htmlFor="status"
            label="Status"
            error={form.formState.errors.status?.message}
          >
            <LabeledSelect
              id="status"
              items={statusItems}
              value={targetStatus}
              placeholder="Select status"
              invalid={!!form.formState.errors.status}
              disabled={isStatusSelectDisabled}
              onValueChange={(value) => {
                if (!value) return
                form.clearErrors(['status', 'assignment_id'])
                form.setValue('status', value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
                if (value === 'OPEN') {
                  form.setValue('assignment_id', null, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              }}
              renderItem={(item) => (
                <>
                  <span
                    className={cn('size-2.5 mt-[5px] rounded-full', SHIPMENT_STATUS_STYLES[item.value].dot)}
                    aria-hidden="true"
                  />
                  {item.label}
                </>
              )}
            />
          </FormField>

          <FormField
            htmlFor="assignment_id"
            label="Assignment"
            error={form.formState.errors.assignment_id?.message}
            description={
              showAssignmentDescription
                ? 'Assignments are selected when moving a shipment into transit.'
                : undefined
            }
          >
            <LabeledSelect
              id="assignment_id"
              items={assignmentItems}
              value={assignmentId ?? ''}
              placeholder="Select assignment"
              invalid={!!form.formState.errors.assignment_id}
              disabled={isAssignmentSelectDisabled}
              onValueChange={(value) => {
                form.clearErrors('assignment_id')
                form.setValue('assignment_id', value || null, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
              renderItem={(item) => (
                <>
                  <span>{item.label}</span>
                  {item.value ? (
                    <span className="text-xs mt-[3px] text-muted-foreground">{`#${item.value}`}</span>
                  ) : null}
                </>
              )}
            />
          </FormField>
        </div>

        <FormField
          htmlFor="delivery_by_date"
          label="Delivery by date"
          error={form.formState.errors.delivery_by_date?.message}
        >
          <DateTimePicker
            id="delivery_by_date"
            value={deliveryByDate}
            onChange={(value) =>
              form.setValue('delivery_by_date', value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            aria-invalid={!!form.formState.errors.delivery_by_date}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-2">
          <FormField htmlFor="lat" label="Latitude" error={form.formState.errors.lat?.message}>
            <Input
              id="lat"
              type="number"
              step="any"
              aria-invalid={!!form.formState.errors.lat}
              {...form.register('lat', { valueAsNumber: true })}
            />
          </FormField>
          <FormField htmlFor="lng" label="Longitude" error={form.formState.errors.lng?.message}>
            <Input
              id="lng"
              type="number"
              step="any"
              aria-invalid={!!form.formState.errors.lng}
              {...form.register('lng', { valueAsNumber: true })}
            />
          </FormField>
        </div>

        <Suspense
          fallback={
            <div className="h-32 flex-none animate-pulse rounded-lg border bg-muted md:min-h-0 md:flex-1 md:basis-0" />
          }
        >
          <ShipmentMap
            shipments={mapShipments}
            selectedShipmentId={shipment.id}
            connectPins={shipments.length > 0}
            className="h-32 flex-none md:min-h-0 md:flex-1 md:basis-0"
          />
        </Suspense>

        <div className="mt-auto flex w-full shrink-0 justify-end gap-2 pt-1 pb-2 sm:pb-0">
          <ConfirmDeleteButton
            label="Delete"
            dialogTitle="Delete shipment?"
            dialogDescription={
              <>This will permanently delete {shipment.label}. This action cannot be undone.</>
            }
            onConfirm={onDelete}
            isPending={deleteShipment.isPending}
            className="flex-1 sm:flex-none"
          />
          <Button
            type="submit"
            disabled={updateShipment.isPending || !isDirty}
            className="flex-1 sm:flex-none"
          >
            {updateShipment.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}

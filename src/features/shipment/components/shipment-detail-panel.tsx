import { useEffect, useMemo } from 'react'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate, toDatetimeLocalValue, fromDatetimeLocalValue } from '@/utils/format-date'
import { useAssignments } from '@/features/assignment/hooks/use-assignments'
import { useShipment } from '@/features/shipment/hooks/use-shipment'
import { useUpdateShipment } from '@/features/shipment/hooks/use-update-shipment'
import { useDeleteShipment } from '@/features/shipment/hooks/use-delete-shipment'
import { shipmentEditSchema, type ShipmentEditValues } from '@/features/shipment/schemas/shipment.schema'
import { SHIPMENT_STATUS_STYLES } from '@/features/shipment/components/shipment-status-styles'
import { ShipmentMap } from '@/features/shipment/components/shipment-map'
import type { Shipment, ShipmentStatus } from '@/features/shipment/types/shipment'
import {
  applyShipmentTransition,
  getTransitionError,
  getValidTargetStatuses,
} from '@/features/shipment/lib/status-transitions'
import { getAssignmentFieldState, getTransitionErrorField } from '@/features/shipment/lib/shipment-form'

interface ShipmentDetailPanelProps {
  shipmentId: string | undefined
  shipments?: Shipment[]
  onClose?: () => void
  onDeleted?: () => void
  className?: string
}

/**
 * Right panel: shows every field of the selected shipment, with
 * delivery_by_date/lat/lng editable via a react-hook-form + zod form.
 * "Save" PUTs the full shipment (existing fields + edits) back to the API.
 */
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

  // Repopulate the form whenever a different shipment loads.
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

  // Memoized so the map (and its O(n^2) route ordering) only recomputes when
  // the shipment set or the edited position actually changes, not on every
  // unrelated re-render of this panel. Hooks must run unconditionally, so
  // this sits above the early returns below and tolerates `shipment` being
  // undefined while the query is still loading.
  const editableMapShipment = useMemo(
    () => (shipment ? { ...shipment, lat: Number(watchedLat), lng: Number(watchedLng) } : undefined),
    [shipment, watchedLat, watchedLng],
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
            <Select
              items={statusItems}
              value={targetStatus}
              onValueChange={(value) => {
                if (!value) return
                form.clearErrors(['status', 'assignment_id'])
                form.setValue('status', value as ShipmentStatus, {
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
              disabled={isStatusSelectDisabled}
            >
              <SelectTrigger
                id="status"
                className="h-10 w-full bg-background disabled:bg-input/50 disabled:opacity-70"
                aria-invalid={!!form.formState.errors.status}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {statusItems.map((status) => (
                    <SelectItem className='flex flex-row py-3 items-center gap-2' key={status.value} value={status.value}>
                      <span
                        className={cn('size-2.5 mt-[5px] rounded-full', SHIPMENT_STATUS_STYLES[status.value].dot)}
                        aria-hidden="true"
                      />
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
            <Select
              items={assignmentItems}
              value={assignmentId ?? ''}
              onValueChange={(value) => {
                form.clearErrors('assignment_id')
                form.setValue('assignment_id', value || null, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }}
              disabled={isAssignmentSelectDisabled}
            >
              <SelectTrigger
                id="assignment_id"
                className="h-10 w-full bg-background disabled:bg-input/50 disabled:opacity-70"
                aria-invalid={!!form.formState.errors.assignment_id}
              >
                <SelectValue placeholder="Select assignment" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {assignmentItems.map((assignment) => (
                    <SelectItem className='flex flex-row py-3 items-center flex-start gap-2' key={assignment.value || 'unassigned'} value={assignment.value}>
                      <span>{assignment.label}</span>
                      {assignment.value ? (
                        <span className='text-xs mt-[3px] text-muted-foreground'>{`#${assignment.value}`}</span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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

        <ShipmentMap
          shipments={mapShipments}
          selectedShipmentId={shipment.id}
          connectPins={shipments.length > 0}
          className="h-32 flex-none md:min-h-0 md:flex-1 md:basis-0"
        />

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

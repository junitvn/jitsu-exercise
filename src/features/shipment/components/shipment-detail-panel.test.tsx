import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ShipmentDetailPanel } from '@/features/shipment/components/shipment-detail-panel'
import type { Shipment } from '@/features/shipment/types/shipment'

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  deleteMutate: vi.fn(),
}))

const shipment: Shipment = {
  id: 'shp_001',
  client_name: 'Sony',
  label: 'LAX-581-250521-1',
  status: 'OPEN',
  arrival_date: '2026-07-25T00:00:00.000Z',
  delivery_by_date: '2026-07-26T00:00:00.000Z',
  eta: '2026-07-26T00:00:00.000Z',
  warehouse_id: '581',
  assignment_id: null,
  lat: 32.7,
  lng: -96.8,
}

vi.mock('@/features/shipment/hooks/use-shipment', () => ({
  useShipment: () => ({
    data: shipment,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/features/assignment/hooks/use-assignments', () => ({
  useAssignments: () => ({
    data: [{ id: 'asg_001', label: 'Dallas AM route' }],
  }),
}))

vi.mock('@/features/shipment/hooks/use-update-shipment', () => ({
  useUpdateShipment: () => ({
    mutate: mocks.mutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}))

vi.mock('@/features/shipment/hooks/use-delete-shipment', () => ({
  useDeleteShipment: () => ({
    mutate: mocks.deleteMutate,
    isPending: false,
    isError: false,
  }),
}))

vi.mock('@/features/shipment/components/shipment-map', () => ({
  ShipmentMap: () => <div data-testid="shipment-map" />,
}))

describe('ShipmentDetailPanel', () => {
  beforeEach(() => {
    mocks.mutate.mockClear()
  })

  it('persists edited coordinates through the update mutation', async () => {
    const user = userEvent.setup()

    render(<ShipmentDetailPanel shipmentId="shp_001" />)

    const saveButton = await screen.findByRole('button', { name: 'Save changes' })
    expect(saveButton).toBeDisabled()

    const latitudeInput = await screen.findByLabelText('Latitude')
    await user.clear(latitudeInput)
    await user.type(latitudeInput, '33.1')

    expect(saveButton).toBeEnabled()

    await user.click(saveButton)

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledTimes(1))
    expect(mocks.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'shp_001',
        lat: 33.1,
        lng: -96.8,
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    )
  })

  it('shows a field error when an assignment is required for transit', async () => {
    const user = userEvent.setup()

    render(<ShipmentDetailPanel shipmentId="shp_001" />)

    await user.click(await screen.findByLabelText('Status'))
    await user.click(await screen.findByRole('option', { name: /in transit/i }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Select an assignment before moving a shipment into transit.')).toBeVisible()
    expect(screen.getByLabelText('Assignment')).toHaveAttribute('aria-invalid', 'true')
    expect(mocks.mutate).not.toHaveBeenCalled()
  })

  it('shows the unsaved status in the header badge and reverts when changed back', async () => {
    const user = userEvent.setup()

    render(<ShipmentDetailPanel shipmentId="shp_001" />)

    expect(await screen.findByLabelText('Shipment status: Open')).toBeVisible()

    await user.click(screen.getByLabelText('Status'))
    await user.click(await screen.findByRole('option', { name: /in transit/i }))

    expect(screen.getByLabelText('Shipment status: In transit')).toBeVisible()

    await user.click(screen.getByLabelText('Status'))
    await user.click(await screen.findByRole('option', { name: /^open$/i }))

    expect(screen.getByLabelText('Shipment status: Open')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled()
  })
})

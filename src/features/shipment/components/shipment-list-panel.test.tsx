import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ShipmentListPanel } from '@/features/shipment/components/shipment-list-panel'

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({
        index,
        key: index,
        size: 72,
        start: index * 72,
      })),
    getTotalSize: () => count * 72,
    measure: vi.fn(),
  }),
}))

vi.mock('@/features/shipment/hooks/use-shipments', () => ({
  useShipments: (status: string, search: string) => ({
    data: {
      pages: [
        {
          items:
            status === 'OPEN' && (!search || 'sony'.includes(search.toLowerCase()))
              ? [
                  {
                    id: 'shp_001',
                    client_name: 'Sony',
                    label: 'LAX-581-250521-1',
                    status: 'OPEN',
                    arrival_date: '2026-07-25T00:00:00.000Z',
                  },
                ]
              : [],
          totalCount: status === 'OPEN' && (!search || 'sony'.includes(search.toLowerCase())) ? 1 : 0,
        },
      ],
    },
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/features/shipment/api/shipment.api', () => ({
  fetchShipments: ({ status, search }: { status: string; search: string }) =>
    Promise.resolve({
      items: [],
      totalCount: status === 'OPEN' && (!search || 'sony'.includes(search.toLowerCase())) ? 1 : 0,
    }),
}))

vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: () => false,
}))

describe('ShipmentListPanel', () => {
  it('searches and clears shipment results', async () => {
    const queryClient = new QueryClient()
    const user = userEvent.setup()

    render(
      <QueryClientProvider client={queryClient}>
        <ShipmentListPanel selectedId={undefined} selectedStatus={undefined} onSelect={vi.fn()} />
      </QueryClientProvider>,
    )

    expect(screen.getByText('Sony')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Search shipments'), 'zzz')
    expect(await screen.findByText('No matching shipments')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Clear shipment search'))
    expect(await screen.findByText('Sony')).toBeInTheDocument()
  })

  it('keeps the selected row and highlights its group with the brand border', () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <ShipmentListPanel selectedId="shp_001" selectedStatus="OPEN" onSelect={vi.fn()} />
      </QueryClientProvider>,
    )

    expect(screen.getByRole('button', { name: /Sony/ })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('button', { pressed: true })).toHaveClass('border-primary')
  })
})

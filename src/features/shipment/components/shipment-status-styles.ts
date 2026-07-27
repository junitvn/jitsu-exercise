import type { ShipmentStatus } from '@/features/shipment/types/shipment'

interface ShipmentStatusStyle {
  label: string
  badge: string
  group: string
  groupHeader: string
  dot: string
  markerColor: string
}

export const SHIPMENT_STATUS_STYLES: Record<ShipmentStatus, ShipmentStatusStyle> = {
  OPEN: {
    label: 'Open',
    badge: 'border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200',
    group: 'border-sky-200/80 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/30',
    groupHeader: 'bg-sky-100/80 hover:bg-sky-100 dark:bg-sky-950/70 dark:hover:bg-sky-950',
    dot: 'bg-sky-500',
    markerColor: '#0ea5e9',
  },
  IN_TRANSIT: {
    label: 'In transit',
    badge: 'border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
    group: 'border-amber-200/80 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30',
    groupHeader: 'bg-amber-100/80 hover:bg-amber-100 dark:bg-amber-950/70 dark:hover:bg-amber-950',
    dot: 'bg-amber-500',
    markerColor: '#f59e0b',
  },
  DELIVERED: {
    label: 'Delivered',
    badge: 'border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    group: 'border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30',
    groupHeader:
      'bg-emerald-100/80 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:hover:bg-emerald-950',
    dot: 'bg-emerald-500',
    markerColor: '#10b981',
  },
}

import type { AssignmentStatus } from '@/features/assignment/types/assignment'

export const ASSIGNMENT_STATUSES: AssignmentStatus[] = ['OPEN', 'COMPLETED']

export const ASSIGNMENT_STATUS_STYLES: Record<
  AssignmentStatus,
  { label: string; badge: string; groupHeader: string; dot: string }
> = {
  OPEN: {
    label: 'Open',
    badge: 'border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200',
    groupHeader: 'bg-sky-100/80 dark:bg-sky-950/70',
    dot: 'bg-sky-500',
  },
  COMPLETED: {
    label: 'Completed',
    badge:
      'border-emerald-200 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    groupHeader: 'bg-emerald-100/80 dark:bg-emerald-950/70',
    dot: 'bg-emerald-500',
  },
}

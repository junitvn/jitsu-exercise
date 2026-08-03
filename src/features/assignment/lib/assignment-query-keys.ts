import type { AssignmentStatus } from '@/features/assignment/types/assignment'

export const assignmentQueryKeys = {
  all: ['assignments'] as const,
  list: (status?: AssignmentStatus, search = '') =>
    [...assignmentQueryKeys.all, status ?? 'all', search] as const,
  pagedList: (status: AssignmentStatus | undefined, search: string) =>
    [...assignmentQueryKeys.all, 'paged', status ?? 'all', search] as const,
  count: (status: AssignmentStatus | undefined, search: string) =>
    [...assignmentQueryKeys.all, 'count', status ?? 'any', search] as const,
  details: () => ['assignment'] as const,
  detail: (id: string) => [...assignmentQueryKeys.details(), id] as const,
}

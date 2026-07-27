import { useQuery } from '@tanstack/react-query'
import { fetchAssignments } from '@/features/assignment/api/assignment.api'
import type { AssignmentStatus } from '@/features/assignment/types/assignment'

export function useAssignments(status?: AssignmentStatus, search = '') {
  return useQuery({
    queryKey: ['assignments', status ?? 'all', search],
    queryFn: ({ signal }) => fetchAssignments({ status, search, signal }),
  })
}

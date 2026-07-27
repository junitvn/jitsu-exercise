import { useQuery } from '@tanstack/react-query'
import { fetchAssignments } from '@/features/assignment/api/assignment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import type { AssignmentStatus } from '@/features/assignment/types/assignment'

export function useAssignments(status?: AssignmentStatus, search = '', enabled = true) {
  return useQuery({
    queryKey: assignmentQueryKeys.list(status, search),
    queryFn: ({ signal }) => fetchAssignments({ status, search, signal }),
    enabled,
  })
}

import { useQuery } from '@tanstack/react-query'
import { fetchAssignmentById } from '@/features/assignment/api/assignment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'

export function useAssignment(id: string | undefined) {
  return useQuery({
    queryKey: assignmentQueryKeys.detail(id ?? ''),
    queryFn: () => fetchAssignmentById(id as string),
    enabled: Boolean(id),
  })
}

import { useQuery } from '@tanstack/react-query'
import { fetchAssignmentById } from '@/features/assignment/api/assignment.api'

export function useAssignment(id: string | undefined) {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: () => fetchAssignmentById(id as string),
    enabled: Boolean(id),
  })
}

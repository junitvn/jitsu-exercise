import { useQueries } from '@tanstack/react-query'
import { fetchAssignmentCount } from '@/features/assignment/api/assignment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import type { AssignmentStatus } from '@/features/assignment/types/assignment'

export interface AssignmentCountRequest {
  key: string
  status?: AssignmentStatus
  search?: string
}

export function useAssignmentCounts(
  requests: AssignmentCountRequest[],
): Map<string, number | undefined> {
  const results = useQueries({
    queries: requests.map((request) => ({
      queryKey: assignmentQueryKeys.count(request.status, request.search ?? ''),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchAssignmentCount({ status: request.status, search: request.search, signal }),
      staleTime: 30_000,
    })),
  })

  const counts = new Map<string, number | undefined>()
  requests.forEach((request, index) => {
    counts.set(request.key, results[index]?.data)
  })
  return counts
}

import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchAssignmentsPage } from '@/features/assignment/api/assignment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import type { AssignmentStatus } from '@/features/assignment/types/assignment'

export function useAssignmentsInfinite(status: AssignmentStatus | undefined, search: string) {
  return useInfiniteQuery({
    queryKey: assignmentQueryKeys.pagedList(status, search),
    queryFn: ({ pageParam, signal }) =>
      fetchAssignmentsPage({ status, search, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.items.length === 0) return undefined
      const fetchedSoFar = allPages.reduce((sum, page) => sum + page.items.length, 0)
      if (lastPage.totalCount !== undefined && fetchedSoFar >= lastPage.totalCount) {
        return undefined
      }
      return allPages.length + 1
    },
  })
}

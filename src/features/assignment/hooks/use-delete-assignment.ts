import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAssignment } from '@/features/assignment/api/assignment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'

export function useDeleteAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: assignmentQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: assignmentQueryKeys.all })
    },
  })
}

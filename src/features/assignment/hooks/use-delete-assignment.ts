import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAssignment } from '@/features/assignment/api/assignment.api'

export function useDeleteAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['assignment', id] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

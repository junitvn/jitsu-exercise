import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAssignment } from '@/features/assignment/api/assignment.api'

export function useCreateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

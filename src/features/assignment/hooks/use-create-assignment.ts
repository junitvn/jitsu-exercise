import { createAssignment } from '@/features/assignment/api/assignment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import { createUseCreateMutation } from '@/lib/query-factory'

export const useCreateAssignment = createUseCreateMutation({
  createFn: createAssignment,
  invalidateKeys: [assignmentQueryKeys.all],
})

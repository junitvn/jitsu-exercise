import { deleteAssignment } from '@/features/assignment/api/assignment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import { createUseDeleteMutation } from '@/lib/query-factory'

export const useDeleteAssignment = createUseDeleteMutation({
  deleteFn: deleteAssignment,
  detailKey: assignmentQueryKeys.detail,
  invalidateKeys: [assignmentQueryKeys.all],
})

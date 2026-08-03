import { fetchAssignmentById } from '@/features/assignment/api/assignment.api'
import { assignmentQueryKeys } from '@/features/assignment/lib/assignment-query-keys'
import { createUseDetailQuery } from '@/lib/query-factory'

export const useAssignment = createUseDetailQuery(assignmentQueryKeys.detail, fetchAssignmentById)

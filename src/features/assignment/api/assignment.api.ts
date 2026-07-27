import { apiClient } from '@/api/client'
import type { Assignment, AssignmentStatus } from '@/features/assignment/types/assignment'

interface FetchAssignmentsParams {
  status?: AssignmentStatus
  search?: string
  signal?: AbortSignal
}

export async function fetchAssignments({
  status,
  search,
  signal,
}: FetchAssignmentsParams = {}): Promise<Assignment[]> {
  const response = await apiClient.get<Assignment[]>('/assignments', {
    signal,
    params: {
      status,
      q: search || undefined,
    },
  })
  return response.data
}

export async function fetchAssignmentById(id: string): Promise<Assignment> {
  const response = await apiClient.get<Assignment>(`/assignments/${id}`)
  return response.data
}

export async function createAssignment(assignment: Assignment): Promise<Assignment> {
  const response = await apiClient.post<Assignment>('/assignments', assignment)
  return response.data
}

export async function updateAssignment(assignment: Assignment): Promise<Assignment> {
  const response = await apiClient.put<Assignment>(`/assignments/${assignment.id}`, assignment)
  return response.data
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiClient.delete(`/assignments/${id}`)
}

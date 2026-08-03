import { apiClient } from '@/api/client'
import type { Assignment, AssignmentStatus } from '@/features/assignment/types/assignment'

export const ASSIGNMENTS_PAGE_SIZE = 50

export interface AssignmentsPage {
  items: Assignment[]
  totalCount: number | undefined
}

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

interface FetchAssignmentsPageParams extends FetchAssignmentsParams {
  page: number
}

export async function fetchAssignmentsPage({
  status,
  search,
  page,
  signal,
}: FetchAssignmentsPageParams): Promise<AssignmentsPage> {
  const response = await apiClient.get<Assignment[]>('/assignments', {
    signal,
    params: {
      status,
      q: search || undefined,
      _page: page,
      _per_page: ASSIGNMENTS_PAGE_SIZE,
    },
  })

  const totalCountHeader = response.headers['x-total-count']

  return {
    items: response.data,
    totalCount: totalCountHeader ? Number(totalCountHeader) : undefined,
  }
}

export async function fetchAssignmentCount({
  status,
  search,
  signal,
}: FetchAssignmentsParams = {}): Promise<number> {
  const response = await apiClient.get<Assignment[]>('/assignments', {
    signal,
    params: {
      status,
      q: search || undefined,
      _page: 1,
      _per_page: 1,
    },
  })

  const totalCountHeader = response.headers['x-total-count']
  return totalCountHeader ? Number(totalCountHeader) : response.data.length
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

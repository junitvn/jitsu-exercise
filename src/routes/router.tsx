import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/routes/root'

const HomePage = lazy(() => import('@/routes/home').then((m) => ({ default: m.HomePage })))
const AssignmentsPage = lazy(() =>
  import('@/routes/assignments').then((m) => ({ default: m.AssignmentsPage })),
)
const AssignmentDetailPage = lazy(() =>
  import('@/features/assignment/components/assignment-detail-page').then((m) => ({
    default: m.AssignmentDetailPage,
  })),
)

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'assignments', Component: AssignmentsPage },
      { path: 'assignments/:assignmentId', Component: AssignmentDetailPage },
    ],
  },
])

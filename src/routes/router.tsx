import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/routes/root'
import { HomePage } from '@/routes/home'
import { AssignmentsPage } from '@/routes/assignments'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'assignments', Component: AssignmentsPage },
    ],
  },
])

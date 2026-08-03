import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatusTabBar } from '@/components/ui/status-tab-bar'
import { useAssignments } from '@/features/assignment/hooks/use-assignments'
import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_STATUS_STYLES,
} from '@/features/assignment/components/assignment-status-styles'
import type { AssignmentStatus } from '@/features/assignment/types/assignment'

interface AssignmentGroupProps {
  search: string
  selectedId?: string
  onSelect: (id: string) => void
}

export function AssignmentGroup({ search, selectedId, onSelect }: AssignmentGroupProps) {
  const [activeStatus, setActiveStatus] = useState<AssignmentStatus>('OPEN')
  const { data: assignments = [], isLoading, isError, refetch } = useAssignments(undefined, search)
  const selectedAssignmentStatus = assignments.find(
    (assignment) => assignment.id === selectedId,
  )?.status
  const assignmentGroups = useMemo(
    () =>
      ASSIGNMENT_STATUSES.map((status) => ({
        status,
        assignments: assignments.filter((assignment) => assignment.status === status),
        styles: ASSIGNMENT_STATUS_STYLES[status],
      })),
    [assignments],
  )
  const activeAssignmentGroup = assignmentGroups.find((group) => group.status === activeStatus)
    ?? assignmentGroups[0]
  const styles = ASSIGNMENT_STATUS_STYLES[activeStatus]

  useEffect(() => {
    if (selectedAssignmentStatus) {
      setActiveStatus(selectedAssignmentStatus)
    }
  }, [selectedAssignmentStatus])

  return (
    <section
      aria-label={`${styles.label} assignments`}
      className="flex min-h-0 flex-1 flex-col gap-2"
    >
      <StatusTabBar<AssignmentStatus>
        columns={2}
        activeKey={activeStatus}
        onChange={setActiveStatus}
        items={assignmentGroups.map((group) => ({
          key: group.status,
          label: group.styles.label,
          dot: group.styles.dot,
          count: group.assignments.length,
        }))}
      />
      <div
        className="min-h-0 flex-1 overflow-auto rounded-xl border bg-background"
      >
        {isLoading ? (
          <p className="p-3 text-sm text-muted-foreground">Loading...</p>
        ) : isError ? (
          <div className="p-3 text-sm">
            <p className="text-destructive">Could not load assignments.</p>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => refetch()}
              className="px-0"
            >
              Retry
            </Button>
          </div>
        ) : activeAssignmentGroup.assignments.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            {search ? 'No matching assignments' : `No ${styles.label.toLowerCase()} assignments`}
          </p>
        ) : (
          activeAssignmentGroup.assignments.map((assignment) => {
            const isSelected = selectedId === assignment.id

            return (
              <button
                key={assignment.id}
                type="button"
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => onSelect(assignment.id)}
                className={cn(
                  'relative flex w-full flex-col gap-1 border-t px-3 py-2 text-left transition-colors first:border-t-0 hover:bg-muted/50',
                  isSelected && 'bg-muted/40 pl-6 hover:bg-muted/40',
                )}
              >
                {isSelected && (
                  <div
                    className="absolute inset-y-2 left-2 w-2.5 rounded-l-full border-y-[2.5px] border-l-[5px] border-r-0 border-primary"
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    'truncate text-sm font-medium',
                    isSelected && 'font-semibold text-primary',
                  )}
                >
                  {assignment.label}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {assignment.shipment_count} shipments
                </span>
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}

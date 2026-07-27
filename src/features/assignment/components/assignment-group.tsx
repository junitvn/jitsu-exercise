import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAssignments } from '@/features/assignment/hooks/use-assignments'
import { ASSIGNMENT_STATUS_STYLES } from '@/features/assignment/components/assignment-status-styles'
import type { AssignmentStatus } from '@/features/assignment/types/assignment'

interface AssignmentGroupProps {
  status: AssignmentStatus
  search: string
  selectedId?: string
  onSelect: (id: string) => void
}

export function AssignmentGroup({ status, search, selectedId, onSelect }: AssignmentGroupProps) {
  const { data: assignments = [], isLoading, isError, refetch } = useAssignments(status, search)
  const styles = ASSIGNMENT_STATUS_STYLES[status]

  return (
    <section className="mb-2 overflow-hidden rounded-xl border bg-background">
      <div className="flex min-h-11 items-center gap-2 border-b bg-muted/60 px-3 py-2">
        <span className="flex-1 text-sm font-semibold">{styles.label}</span>
        <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium tabular-nums">
          {assignments.length}
        </span>
      </div>
      {isLoading ? (
        <p className="p-3 text-sm text-muted-foreground">Loading…</p>
      ) : isError ? (
        <div className="p-3 text-sm">
          <p className="text-destructive">Could not load assignments.</p>
          <Button type="button" variant="link" size="sm" onClick={() => refetch()} className="px-0">
            Retry
          </Button>
        </div>
      ) : assignments.length === 0 ? (
        <p className="p-3 text-sm text-muted-foreground">
          {search ? 'No matching assignments' : 'No assignments'}
        </p>
      ) : (
        assignments.map((assignment) => {
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
              <span className="text-xs text-muted-foreground">
                {assignment.shipment_count} shipments
              </span>
            </button>
          )
        })
      )}
    </section>
  )
}

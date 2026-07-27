import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateAssignment } from '@/features/assignment/hooks/use-create-assignment'
import type { Assignment } from '@/features/assignment/types/assignment'

interface CreateAssignmentDialogProps {
  onClose: () => void
  onCreated: (assignment: Assignment) => void
}

export function CreateAssignmentDialog({ onClose, onCreated }: CreateAssignmentDialogProps) {
  const [label, setLabel] = useState('')
  const createAssignment = useCreateAssignment()
  const trimmedLabel = label.trim()
  const id = useMemo(() => `asg_${Date.now().toString(36)}`, [])

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trimmedLabel) return

    createAssignment.mutate(
      {
        id,
        label: trimmedLabel,
        status: 'OPEN',
        clients: [],
        shipment_count: 0,
      },
      {
        onSuccess: (assignment) => {
          onCreated(assignment)
          onClose()
        },
      },
    )
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Create assignment" className="fixed inset-0 z-[1100]">
      <button
        type="button"
        aria-label="Close create assignment"
        onClick={onClose}
        className="absolute inset-0 bg-black/35"
      />
      <form
        onSubmit={onSubmit}
        className="absolute top-1/2 left-1/2 flex w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border bg-background p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Create assignment</h2>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Close" onClick={onClose}>
            <X aria-hidden="true" />
          </Button>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-assignment-label">Label</Label>
          <Input
            id="new-assignment-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!trimmedLabel || createAssignment.isPending}>
            {createAssignment.isPending ? 'Creating…' : 'Create'}
          </Button>
        </div>
        {createAssignment.isError && (
          <p className="text-xs text-destructive">Failed to create assignment. Try again.</p>
        )}
      </form>
    </div>
  )
}

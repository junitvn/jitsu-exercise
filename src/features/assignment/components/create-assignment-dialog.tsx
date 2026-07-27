import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[min(92vw,420px)]">
        <form onSubmit={onSubmit} aria-label="Create assignment" className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Create assignment</DialogTitle>
          </DialogHeader>
          <FormField htmlFor="new-assignment-label" label="Label">
            <Input
              id="new-assignment-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              autoFocus
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!trimmedLabel || createAssignment.isPending}>
              {createAssignment.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
          {createAssignment.isError ? (
            <p className="text-xs text-destructive">Failed to create assignment. Try again.</p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  )
}

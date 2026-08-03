import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ConfirmDeleteButtonProps {
  label: string
  dialogTitle: string
  dialogDescription: ReactNode
  onConfirm: () => void
  isPending?: boolean
  disabledReason?: string
  className?: string
}

export function ConfirmDeleteButton({
  label,
  dialogTitle,
  dialogDescription,
  onConfirm,
  isPending = false,
  disabledReason,
  className,
}: ConfirmDeleteButtonProps) {
  const isDisabled = isPending || Boolean(disabledReason)

  return (
    <Tooltip disabled={!disabledReason}>
      <TooltipTrigger
        render={<span className={cn('inline-flex', className)} tabIndex={disabledReason ? 0 : undefined} />}
      >
        <AlertDialog>
          <AlertDialogTrigger
            render={<Button type="button" variant="destructive" disabled={isDisabled} className="w-full" />}
          >
            <Trash2 aria-hidden="true" />
            {isPending ? 'Deleting…' : label}
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
              <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onConfirm}>
                {label}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  )
}

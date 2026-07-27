import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface CopyableIdProps {
  label: string
  value: string | null | undefined
  emptyValue?: string
  className?: string
}

async function copyToClipboard(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.add({
      type: 'success',
      title: 'Copied',
      description: `${label} copied to clipboard.`,
    })
  } catch {
    toast.add({
      type: 'error',
      title: 'Could not copy',
      description: 'Clipboard access is unavailable.',
    })
  }
}

function CopyableId({ label, value, emptyValue = 'Unassigned', className }: CopyableIdProps) {
  if (!value) {
    return <span className={className}>{emptyValue}</span>
  }

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
      <span className="truncate">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="text-muted-foreground hover:text-foreground"
        aria-label={`Copy ${label}`}
        title={`Copy ${label}`}
        onClick={() => copyToClipboard(value, label)}
      >
        <Copy aria-hidden="true" />
      </Button>
    </span>
  )
}

export { CopyableId }

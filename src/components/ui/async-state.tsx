import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AsyncStateProps {
  variant: 'loading' | 'error' | 'empty'
  message: ReactNode
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function AsyncState({
  variant,
  message,
  onRetry,
  retryLabel = 'Retry',
  className,
}: AsyncStateProps) {
  if (variant === 'loading') {
    return <div className={cn('p-4 text-sm text-muted-foreground', className)}>{message}</div>
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm',
        variant === 'error' ? 'text-destructive' : 'text-muted-foreground',
        className,
      )}
    >
      <p>{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

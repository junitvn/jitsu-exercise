import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MobileHeaderProps {
  title?: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
  action?: ReactNode
  onBack?: () => void
  backLabel?: string
  showLogo?: boolean
  className?: string
}

function MobileHeader({
  title,
  subtitle,
  badge,
  action,
  onBack,
  backLabel = 'Back',
  showLogo = false,
  className,
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b bg-background/95 px-3 shadow-sm backdrop-blur md:hidden',
        className,
      )}
    >
      {onBack && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={backLabel}
          onClick={onBack}
          className="-ml-2 mr-1.5"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Button>
      )}

      {!onBack && showLogo && (
        <img
          src="/logo-jitsu-icon.svg"
          alt=""
          className="h-7 w-4 mr-2 max-w-none object-contain sm:h-14"
        />
      )}

      <div className="min-w-0 flex-1 pr-2">
        {typeof title === 'string' ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[22px] md:text-lg font-semibold tracking-tight">
              {title}
            </span>
            {badge}
          </div>
        ) : (
          title && (
            <div className="flex min-w-0 items-center gap-1.5">
              {title}
              {badge}
            </div>
          )
        )}
        {subtitle}
      </div>

      {action}
    </header>
  )
}

export { MobileHeader }
export type { MobileHeaderProps }

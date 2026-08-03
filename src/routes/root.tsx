import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { ChevronsLeft, ChevronsRight, ClipboardList, PackageSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigationItems = [
  { to: '/', label: 'Shipments', icon: PackageSearch, end: true },
  { to: '/assignments', label: 'Assignments', icon: ClipboardList },
]

export function RootLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

  return (
    <div className="flex min-h-svh bg-slate-50 dark:bg-slate-950">
      <aside
        className={cn(
          'sticky top-4 z-30 m-4 mr-0 hidden h-[calc(100svh-2rem)] shrink-0 flex-col overflow-hidden rounded-2xl border bg-background p-3 pt-4 shadow-sm transition-[width] duration-200 md:flex',
          isSidebarCollapsed ? 'w-18' : 'w-60',
        )}
      >
        <SidebarHeader isCollapsed={isSidebarCollapsed} />
        <SidebarNavigation isCollapsed={isSidebarCollapsed} />
        <SidebarFooter
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        />
      </aside>

      <BottomTabNavigation />

      <div className="min-w-0 flex-1 md:pt-0 pt-14 [&>main]:h-[calc(100svh-6.75rem)] md:[&>main]:h-svh">
        <Outlet />
      </div>
    </div>
  )
}

function SidebarHeader({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="mb-3 sm:mb-7 flex items-center">
      <SidebarLogo isCollapsed={isCollapsed} />
    </div>
  )
}

function SidebarFooter({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean
  onToggle: () => void
}) {
  return (
    <div className={cn('mt-auto pt-3', isCollapsed ? 'flex justify-center' : '')}>
      <Button
        type="button"
        variant="ghost"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!isCollapsed}
        onClick={onToggle}
        className={cn(
          'inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isCollapsed ? 'w-10' : 'w-full px-3',
        )}
      >
        {isCollapsed ? (
          <ChevronsRight aria-hidden="true" className="size-4" />
        ) : (
          <ChevronsLeft aria-hidden="true" className="size-4" />
        )}
      </Button>
    </div>
  )
}

function SidebarLogo({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return (
    <div
      role="img"
      aria-label="Jitsu"
      className={cn('flex min-w-0 items-center', isCollapsed ? 'justify-center h-10' : 'h-10 flex-1 pt-2')}
    >
      <div
        className={cn(
          'flex min-w-0 items-center transition-[gap] duration-200',
          isCollapsed ? 'gap-0' : 'gap-2',
        )}
      >
        <span
          aria-hidden={isCollapsed}
          className={cn(
            'block overflow-hidden transition-[max-width,opacity] duration-200 ease-out',
            isCollapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100',
          )}
        >
          <img
            src="/logo-jitsu-text.svg"
            alt=""
            className="h-9 max-w-none object-contain sm:h-14"
          />
        </span>
        <img
          src="/logo-jitsu-icon.svg"
          alt=""
          aria-hidden="true"
          className={cn(
            'shrink-0 object-contain transition-[width,height,margin] duration-200',
            isCollapsed ? 'h-9 w-10' : 'h-9 sm:h-10 sm:mb-2.5',
          )}
        />
      </div>
    </div>
  )
}

function SidebarNavigation({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {navigationItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'relative flex h-11 w-full items-center gap-3 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isCollapsed ? 'justify-center px-0' : 'px-3',
              isActive &&
              (isCollapsed
                ? 'bg-muted/40 text-primary hover:bg-muted/40 hover:text-primary'
                : 'bg-muted/40 pl-7 text-primary hover:bg-muted/40 hover:text-primary'),
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <div
                  className={cn(
                    'absolute inset-y-2 w-2.5 rounded-l-full border-y-[2.5px] border-l-[5px] border-r-0 border-primary',
                    isCollapsed ? 'left-1' : 'left-3',
                  )}
                  aria-hidden="true"
                />
              )}
              <Icon aria-hidden="true" className={cn('size-4', isActive && 'text-primary')} />
              <span className={cn(isCollapsed && 'sr-only', isActive && 'font-semibold')}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function BottomTabNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-6px_18px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-2 gap-1">
        {navigationItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex h-10 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive && 'text-primary hover:bg-muted/60 hover:text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon aria-hidden="true" className={cn('size-5', isActive && 'text-primary')} />
                <span className={cn('truncate', isActive && 'font-semibold')}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

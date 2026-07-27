import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { cn } from '@/lib/utils'

function Sheet({
  open,
  onOpenChange,
  children,
  ...props
}: DialogPrimitive.Root.Props & { children: React.ReactNode }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} data-slot="sheet" {...props}>
      {children}
    </DialogPrimitive.Root>
  )
}

function SheetContent({
  side = 'bottom',
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props & { side?: 'left' | 'bottom' }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="sheet-backdrop"
        className="fixed inset-0 z-50 bg-black/35 duration-100 data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0"
      />
      <DialogPrimitive.Viewport data-slot="sheet-viewport" className="fixed inset-0 z-50">
        <DialogPrimitive.Popup
          data-slot="sheet-content"
          className={cn(
            'fixed overflow-hidden border bg-background shadow-2xl outline-hidden duration-150 data-closed:animate-out data-open:animate-in',
            side === 'left' &&
              'inset-y-0 left-0 w-72 max-w-[82vw] border-r data-closed:slide-out-to-left data-open:slide-in-from-left',
            side === 'bottom' &&
              'inset-x-0 bottom-0 rounded-t-2xl data-closed:slide-out-to-bottom data-open:slide-in-from-bottom',
            className,
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  )
}

export { Sheet, SheetContent }

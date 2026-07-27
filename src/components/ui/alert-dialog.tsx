import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function AlertDialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

const alertDialogContentVariants = cva(
  "fixed top-1/2 left-1/2 z-[1100] flex max-h-[calc(100svh-2rem)] w-full -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-auto rounded-lg border bg-background p-6 text-foreground shadow-lg outline-hidden duration-100 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
  {
    variants: {
      size: {
        default: "max-w-lg",
        sm: "max-w-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function AlertDialogContent({
  className,
  size,
  ...props
}: DialogPrimitive.Popup.Props & VariantProps<typeof alertDialogContentVariants>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="alert-dialog-backdrop"
        className="fixed inset-0 z-[1090] bg-black/50 duration-100 data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0"
      />
      <DialogPrimitive.Viewport data-slot="alert-dialog-viewport" className="fixed inset-0 z-[1100]">
        <DialogPrimitive.Popup
          data-slot="alert-dialog-content"
          className={cn(alertDialogContentVariants({ size, className }))}
          {...props}
        />
      </DialogPrimitive.Viewport>
    </DialogPrimitive.Portal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-row justify-end gap-2", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      render={<Button variant="outline" />}
      className={className}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  variant = "default",
  ...props
}: DialogPrimitive.Close.Props & VariantProps<typeof buttonVariants>) {
  return (
    <DialogPrimitive.Close
      data-slot="alert-dialog-action"
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
}

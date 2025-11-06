import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin text-muted-foreground", {
  variants: {
    size: {
      default: "h-4 w-4",
      sm: "h-3 w-3",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, label, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label={label || "Loading"}
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <Loader2 className={cn(spinnerVariants({ size }))} />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <span className="sr-only">{label || "Loading"}</span>
    </div>
  )
)
Spinner.displayName = "Spinner"

export { Spinner, spinnerVariants }

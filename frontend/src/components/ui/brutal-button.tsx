import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const brutalButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-bounce disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground brutal-button",
        secondary: "bg-secondary text-secondary-foreground brutal-button",
        accent: "bg-accent text-accent-foreground brutal-button",
        ghost: "hover:bg-muted hover:text-muted-foreground transition-smooth rounded-2xl px-6 py-3",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth rounded-2xl px-6 py-3",
        hero: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground brutal-button text-lg font-black px-8 py-4 rounded-3xl",
      },
      size: {
        default: "px-6 py-3 rounded-2xl",
        sm: "px-4 py-2 rounded-xl text-sm",
        lg: "px-8 py-4 rounded-3xl text-lg",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BrutalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brutalButtonVariants> {
  asChild?: boolean
}

const BrutalButton = React.forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(brutalButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
BrutalButton.displayName = "BrutalButton"

export { BrutalButton, brutalButtonVariants }
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const brutalButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold font-montserrat transition-smooth disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "brutal-button text-primary-foreground",
        secondary: "brutal-button bg-secondary text-secondary-foreground",
        accent: "brutal-button bg-accent text-accent-foreground",
        ghost:
          "px-6 py-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40",
        outline:
          "px-6 py-3 rounded-full border border-primary/40 text-foreground hover:bg-primary/10",
        hero: "brutal-button text-primary-foreground text-lg font-bold px-8 py-4",
      },
      size: {
        default: "px-6 py-3 rounded-full",
        sm: "px-4 py-2 rounded-full text-sm",
        lg: "px-8 py-4 rounded-full text-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BrutalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brutalButtonVariants> {
  asChild?: boolean;
}

const BrutalButton = React.forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(brutalButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
BrutalButton.displayName = "BrutalButton";

export { BrutalButton, brutalButtonVariants };

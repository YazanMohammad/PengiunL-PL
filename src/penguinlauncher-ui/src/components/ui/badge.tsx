import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-primary hover:bg-primary/30",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/20 text-destructive-foreground hover:bg-destructive/30",
        outline: "text-foreground border-white/10",
        active:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 font-medium",
        steam:
          "border-sky-500/30 bg-sky-950/70 text-sky-300 font-medium shadow-sm shadow-sky-900/30",
        riot:
          "border-rose-500/30 bg-rose-950/70 text-rose-300 font-medium shadow-sm shadow-rose-900/30",
        epic:
          "border-neutral-500/30 bg-neutral-900/80 text-neutral-300 font-medium",
        ea:
          "border-amber-500/30 bg-amber-950/70 text-amber-300 font-medium",
        linux:
          "border-yellow-500/30 bg-yellow-950/70 text-yellow-300 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

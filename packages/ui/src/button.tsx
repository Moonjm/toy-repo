import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, variant = "primary", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-semibold transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-slate-900 text-white hover:bg-slate-800",
          variant === "secondary" &&
            "bg-slate-100 text-slate-900 hover:bg-slate-200",
          variant === "ghost" && "text-slate-900 hover:bg-slate-100",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

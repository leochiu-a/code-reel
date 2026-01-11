import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { AnimatedIconHandle } from "./types";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white",
        outline:
          "bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = Omit<React.ComponentProps<"button">, "onMouseEnter" | "onMouseLeave"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    animatedIcon?: React.ReactElement;
    onMouseEnter?: React.MouseEventHandler<HTMLElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  animatedIcon,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const iconRef = React.useRef<AnimatedIconHandle | null>(null);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    onMouseEnter?.(event);
    if (event.defaultPrevented || props.disabled) return;
    iconRef.current?.startAnimation();
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    onMouseLeave?.(event);
    if (event.defaultPrevented) return;
    iconRef.current?.stopAnimation();
  };

  const iconNode = animatedIcon
    ? React.cloneElement(animatedIcon as React.ReactElement, { ref: iconRef })
    : null;

  if (asChild && React.isValidElement(children)) {
    const child = React.Children.only(children) as React.ReactElement<{
      className?: string;
      onMouseEnter?: React.MouseEventHandler<HTMLElement>;
      onMouseLeave?: React.MouseEventHandler<HTMLElement>;
      children?: React.ReactNode;
    }>;
    const childOnMouseEnter = child.props.onMouseEnter;
    const childOnMouseLeave = child.props.onMouseLeave;

    return React.cloneElement(
      child,
      {
        ...props,
        "data-slot": "button",
        "data-variant": variant,
        "data-size": size,
        className: cn(buttonVariants({ variant, size, className }), child.props.className),
        onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
          childOnMouseEnter?.(event);
          handleMouseEnter(event);
        },
        onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
          childOnMouseLeave?.(event);
          handleMouseLeave(event);
        },
      },
      iconNode,
      child.props.children,
    );
  }

  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {iconNode}
      {children}
    </button>
  );
}

export { Button, buttonVariants };

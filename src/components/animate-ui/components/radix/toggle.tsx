'use client';

import * as React from 'react';
import { Toggle as TogglePrimitive } from 'radix-ui';
import { AnimatePresence, motion, type HTMLMotionProps } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { getStrictContext } from '@/lib/get-strict-context';
import { useControlledState } from '@/hooks/use-controlled-state';

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-xs font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50 data-[state=on]:text-white data-[state=on]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-white/10 bg-transparent',
      },
      size: {
        default: 'h-8 px-3',
        sm: 'h-7 px-2',
        lg: 'h-9 px-4',
        icon: 'size-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ToggleContextType = {
  isPressed: boolean;
  setIsPressed: (isPressed: boolean) => void;
  disabled?: boolean;
};

const [ToggleProvider, useToggle] =
  getStrictContext<ToggleContextType>('ToggleContext');

type TogglePrimitiveProps = Omit<
  React.ComponentProps<typeof TogglePrimitive.Root>,
  'asChild'
> &
  HTMLMotionProps<'button'>;

type ToggleItemProps = HTMLMotionProps<'div'>;

type ToggleProps = TogglePrimitiveProps &
  ToggleItemProps &
  VariantProps<typeof toggleVariants>;

function ToggleHighlight({ style, ...props }: HTMLMotionProps<'div'>) {
  const { isPressed, disabled } = useToggle();

  return (
    <AnimatePresence>
      {isPressed && (
        <motion.div
          data-slot="toggle-highlight"
          aria-pressed={isPressed}
          data-state={isPressed ? 'on' : 'off'}
          data-disabled={disabled}
          style={{ position: 'absolute', zIndex: 0, inset: 0, ...style }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          {...props}
        />
      )}
    </AnimatePresence>
  );
}

function ToggleItem({ style, ...props }: ToggleItemProps) {
  const { isPressed, disabled } = useToggle();

  return (
    <motion.div
      data-slot="toggle-item"
      aria-pressed={isPressed}
      data-state={isPressed ? 'on' : 'off'}
      data-disabled={disabled}
      style={{ position: 'relative', zIndex: 1, ...style }}
      {...props}
    />
  );
}

function Toggle({
  className,
  variant,
  size,
  pressed,
  defaultPressed,
  onPressedChange,
  disabled,
  ...props
}: ToggleProps) {
  const [isPressed, setIsPressed] = useControlledState({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });

  return (
    <ToggleProvider value={{ isPressed, setIsPressed, disabled }}>
      <TogglePrimitive.Root
        pressed={pressed}
        defaultPressed={defaultPressed}
        onPressedChange={setIsPressed}
        disabled={disabled}
        asChild
      >
        <motion.button data-slot="toggle" whileTap={{ scale: 0.95 }} className="relative">
          <ToggleHighlight className="bg-white/15 rounded-full" />
          <ToggleItem
            className={cn(toggleVariants({ variant, size, className }))}
            {...props}
          />
        </motion.button>
      </TogglePrimitive.Root>
    </ToggleProvider>
  );
}

export { Toggle, toggleVariants, type ToggleProps };

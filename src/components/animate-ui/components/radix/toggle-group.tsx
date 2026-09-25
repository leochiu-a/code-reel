"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { animate, motion, type HTMLMotionProps, type Transition } from "motion/react";
import { type VariantProps } from "class-variance-authority";

import { toggleVariants } from "@/components/animate-ui/components/radix/toggle";
import { cn } from "@/lib/utils";
import { getStrictContext } from "@/lib/get-strict-context";
import { useControlledState } from "@/hooks/use-controlled-state";

type ToggleGroupContextType = {
  type: "single" | "multiple";
  variant?: VariantProps<typeof toggleVariants>["variant"];
  size?: VariantProps<typeof toggleVariants>["size"];
};

const [ToggleGroupProvider, useToggleGroup] =
  getStrictContext<ToggleGroupContextType>("ToggleGroupContext");

const INDICATOR_TRANSITION: Transition = { type: "spring", stiffness: 400, damping: 35 };

/**
 * One pill that slides between the items of a single-select group. It
 * measures the selected item inside the track and springs to it, so there is
 * only ever one element moving rather than a copy per item cross-fading.
 */
function ToggleGroupIndicator({ value }: { value: string | undefined }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const placedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const indicator = ref.current;
    const track = indicator?.parentElement;
    if (!indicator || !track) return;

    const items = () =>
      track.querySelectorAll<HTMLElement>(':scope > [data-slot="toggle-group-item"]');

    // Selection changes spring; the first placement and resizes (fonts
    // loading, items added) snap.
    const moveTo = (shouldAnimate: boolean) => {
      const item = Array.from(items()).find((node) => node.getAttribute("value") === value);
      if (!item) {
        indicator.style.opacity = "0";
        placedRef.current = false;
        return;
      }
      animate(
        indicator,
        {
          x: item.offsetLeft,
          y: item.offsetTop,
          width: item.offsetWidth,
          height: item.offsetHeight,
          opacity: 1,
        },
        shouldAnimate && placedRef.current ? INDICATOR_TRANSITION : { duration: 0 },
      );
      placedRef.current = true;
    };

    moveTo(true);

    let initialCallback = true;
    const observer = new ResizeObserver(() => {
      if (initialCallback) {
        initialCallback = false;
        return;
      }
      moveTo(false);
    });
    observer.observe(track);
    items().forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [value]);

  return (
    <span
      ref={ref}
      aria-hidden
      data-slot="toggle-group-indicator"
      className="pointer-events-none absolute top-0 left-0 rounded-full bg-white/15 opacity-0"
    />
  );
}

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>;

function ToggleGroup({ className, variant, size, children, ...props }: ToggleGroupProps) {
  const [value, setValue] = useControlledState<string | string[] | undefined>({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange as (value: string | string[] | undefined) => void,
  });

  return (
    <ToggleGroupProvider value={{ type: props.type, variant, size }}>
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        className={cn(
          "group/toggle-group relative flex w-fit items-center gap-1 rounded-full border border-white/10 bg-[#222] p-1",
          className,
        )}
        {...props}
        onValueChange={setValue}
      >
        {props.type === "single" && (
          <ToggleGroupIndicator value={typeof value === "string" ? value : undefined} />
        )}
        {children}
      </ToggleGroupPrimitive.Root>
    </ToggleGroupProvider>
  );
}

type ToggleGroupItemProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Item>,
  "asChild"
> &
  HTMLMotionProps<"button"> &
  VariantProps<typeof toggleVariants>;

function ToggleGroupItem({ className, children, variant, size, ...props }: ToggleGroupItemProps) {
  const { variant: contextVariant, size: contextSize, type } = useToggleGroup();

  return (
    <ToggleGroupPrimitive.Item value={props.value} disabled={props.disabled} asChild>
      <motion.button
        data-slot="toggle-group-item"
        data-variant={contextVariant || variant}
        data-size={contextSize || size}
        className={cn(
          toggleVariants({
            variant: contextVariant || variant,
            size: contextSize || size,
          }),
          "relative z-[1] min-w-0 w-full flex-1 basis-0 shrink-0 shadow-none rounded-full focus:z-10 focus-visible:z-10",
          // In a single-select group the sliding indicator is the only
          // background, so the item must not paint its own on hover or when
          // selected; otherwise the clicked item lights up before the pill
          // arrives.
          type === "single" && "hover:bg-transparent data-[state=on]:shadow-none",
          type === "multiple" && "data-[state=on]:bg-white/15",
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps, type ToggleGroupItemProps };

"use client";

import * as React from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { type VariantProps } from "class-variance-authority";

import {
  Highlight,
  HighlightItem,
  type HighlightItemProps,
  type HighlightProps,
} from "@/components/animate-ui/primitives/effects/highlight";
import { toggleVariants } from "@/components/animate-ui/components/radix/toggle";
import { cn } from "@/lib/utils";
import { getStrictContext } from "@/lib/get-strict-context";
import { useControlledState } from "@/hooks/use-controlled-state";

type ToggleGroupContextType = {
  value: string | string[] | undefined;
  setValue: (value: string | string[] | undefined) => void;
  type: "single" | "multiple";
  variant?: VariantProps<typeof toggleVariants>["variant"];
  size?: VariantProps<typeof toggleVariants>["size"];
};

const [ToggleGroupProvider, useToggleGroup] =
  getStrictContext<ToggleGroupContextType>("ToggleGroupContext");

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>;

function ToggleGroup({ className, variant, size, children, ...props }: ToggleGroupProps) {
  const [value, setValue] = useControlledState<string | string[] | undefined>({
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onValueChange as (value: string | string[] | undefined) => void,
  });

  return (
    <ToggleGroupProvider
      value={{
        value,
        setValue,
        type: props.type,
        variant,
        size,
      }}
    >
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        className={cn(
          "group/toggle-group flex w-fit items-center gap-1 rounded-full border border-white/10 bg-[#222] p-1",
          className,
        )}
        {...props}
        onValueChange={setValue}
      >
        {props.type === "single" ? (
          <ToggleGroupHighlight className="rounded-full bg-white/15">
            {children}
          </ToggleGroupHighlight>
        ) : (
          children
        )}
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
    <ToggleGroupHighlightItem
      value={props.value}
      className={cn("flex-1", type === "multiple" && "bg-white/15 rounded-full")}
    >
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
            "min-w-0 w-full flex-1 basis-0 shrink-0 shadow-none rounded-full focus:z-10 focus-visible:z-10",
            className,
          )}
          whileTap={{ scale: 0.95 }}
          {...props}
        >
          {children}
        </motion.button>
      </ToggleGroupPrimitive.Item>
    </ToggleGroupHighlightItem>
  );
}

type ToggleGroupHighlightProps = Omit<HighlightProps, "controlledItems">;

function ToggleGroupHighlight({
  transition = { type: "spring", stiffness: 200, damping: 25 },
  ...props
}: ToggleGroupHighlightProps) {
  const { value } = useToggleGroup();

  return (
    // @ts-expect-error - TODO: fix this
    <Highlight
      data-slot="toggle-group-highlight"
      controlledItems
      value={typeof value === "string" ? value : null}
      exitDelay={0}
      transition={transition}
      {...props}
    />
  );
}

type ToggleGroupHighlightItemProps = HighlightItemProps &
  HTMLMotionProps<"div"> & {
    children: React.ReactElement;
  };

function ToggleGroupHighlightItem({ children, style, ...props }: ToggleGroupHighlightItemProps) {
  const { type, value } = useToggleGroup();

  if (type === "single") {
    return (
      <HighlightItem
        data-slot="toggle-group-highlight-item"
        style={{ inset: 0, ...style }}
        {...props}
      >
        {children}
      </HighlightItem>
    );
  }

  if (type === "multiple" && React.isValidElement(children)) {
    const isActive = props.value && value && value.includes(props.value);

    const element = children as React.ReactElement<React.ComponentProps<"div">>;

    return React.cloneElement(
      children,
      {
        style: {
          ...element.props.style,
          position: "relative",
        },
        ...element.props,
      },
      <>
        <AnimatePresence>
          {isActive && (
            <motion.div
              data-slot="toggle-group-highlight-item"
              style={{ position: "absolute", inset: 0, zIndex: 0, ...style }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              {...props}
            />
          )}
        </AnimatePresence>

        <div
          style={{
            position: "relative",
            zIndex: 1,
          }}
        >
          {element.props.children}
        </div>
      </>,
    );
  }
}

export {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupHighlight,
  ToggleGroupHighlightItem,
  useToggleGroup,
  type ToggleGroupProps,
  type ToggleGroupItemProps,
  type ToggleGroupHighlightProps,
  type ToggleGroupHighlightItemProps,
  type ToggleGroupContextType,
};

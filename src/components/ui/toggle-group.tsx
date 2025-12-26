"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    activeValue?: string
    lastValue?: string
    itemOrder?: Map<string, number>
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
  activeValue: undefined,
  lastValue: undefined,
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  children,
  onValueChange,
  value,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }) {
  const [activeValue, setActiveValue] = React.useState<string | undefined>(
    typeof value === "string" ? value : undefined
  )
  const lastValueRef = React.useRef<string | undefined>(activeValue)
  const itemOrder = React.useMemo(() => {
    const order = new Map<string, number>()
    React.Children.forEach(children, (child, index) => {
      if (!React.isValidElement(child)) return
      const childValue = child.props?.value
      if (typeof childValue === "string") {
        order.set(childValue, index)
      }
    })
    return order
  }, [children])

  const handleValueChange = React.useCallback(
    (nextValue: string | string[]) => {
      if (typeof nextValue === "string") {
        lastValueRef.current = activeValue
        setActiveValue(nextValue)
      }
      onValueChange?.(nextValue)
    },
    [activeValue, onValueChange]
  )

  React.useEffect(() => {
    if (typeof value !== "string" || value === activeValue) return
    lastValueRef.current = activeValue
    setActiveValue(value)
  }, [activeValue, value])

  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "toggle-group group/toggle-group relative flex w-fit items-center gap-[--spacing(var(--gap))] rounded-full bg-slate-800/50 p-1 data-[spacing=default]:data-[variant=outline]:shadow-xs",
        className
      )}
      onValueChange={handleValueChange}
      value={value}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{
          variant,
          size,
          spacing,
          activeValue,
          lastValue: lastValueRef.current,
          itemOrder,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)
  const itemValue = props.value
  let direction: "left" | "right" | undefined

  if (
    typeof itemValue === "string" &&
    context.lastValue &&
    context.itemOrder
  ) {
    const currentIndex = context.itemOrder.get(itemValue)
    const lastIndex = context.itemOrder.get(context.lastValue)
    if (currentIndex != null && lastIndex != null && currentIndex !== lastIndex) {
      direction = currentIndex > lastIndex ? "right" : "left"
    }
  }

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      data-direction={direction}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "toggle-group-item relative w-auto min-w-0 shrink-0 cursor-pointer overflow-hidden rounded-full px-3 text-xs font-medium text-slate-400 transition-all duration-200 hover:bg-slate-700/50 hover:text-slate-200 data-[state=on]:bg-slate-700 data-[state=on]:text-white data-[state=on]:shadow-sm focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:shadow-none data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }

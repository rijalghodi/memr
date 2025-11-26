"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "@/lib/utils";

function ScrollArea({
  className,
  children,
  alwaysShowScrollBar = false,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  alwaysShowScrollBar?: boolean;
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar alwaysShow={alwaysShowScrollBar} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  alwaysShow = false,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & {
  alwaysShow?: boolean;
}) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-always-show={alwaysShow}
      orientation={orientation}
      forceMount={alwaysShow ? true : undefined}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" && "h-full w-2 border-l border-l-transparent",
        orientation === "horizontal" && "h-2 flex-col border-t border-t-transparent",
        alwaysShow && "opacity-100! data-[state=hidden]:opacity-100!",
        className
      )}
      style={
        alwaysShow
          ? {
              opacity: 1,
              pointerEvents: "auto",
            }
          : undefined
      }
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "bg-ring/60 relative flex-1 rounded-full hover:bg-ring",
          alwaysShow && "opacity-100!"
        )}
        style={alwaysShow ? { opacity: 1 } : undefined}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };

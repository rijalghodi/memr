"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface FloatingContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  close: () => void;
}

const FloatingContext = React.createContext<FloatingContextValue | undefined>(undefined);

function useFloatingContext() {
  const context = React.useContext(FloatingContext);
  if (!context) {
    throw new Error("Floating components must be used within Floating");
  }
  return context;
}

export function useFloating() {
  return useFloatingContext();
}

function Floating({
  open,
  onOpenChange,
  ...props
}: React.PropsWithChildren<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = React.useMemo(
    () => (isControlled ? onOpenChange || (() => {}) : setInternalOpen),
    [isControlled, onOpenChange]
  );

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <FloatingContext.Provider value={{ open: isOpen, onOpenChange: setIsOpen, close }}>
      <div data-slot="floating" {...props} />
    </FloatingContext.Provider>
  );
}

function FloatingTrigger({
  className,
  asChild,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
}) {
  const { open, onOpenChange } = useFloatingContext();

  const handleClick = React.useCallback(() => {
    onOpenChange(!open);
  }, [open, onOpenChange]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        handleClick();
        if (typeof (children as any).props?.onClick === "function") {
          (children as any).props.onClick(e);
        }
      },
      "data-state": open ? "open" : "closed",
    });
  }

  return (
    <button
      data-slot="floating-trigger"
      data-state={open ? "open" : "closed"}
      className={cn("data-[state=open]:bg-muted", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

function FloatingContent({
  className,
  sideOffset = 0,
  position = "bottom-right",
  ...props
}: React.ComponentProps<"div"> & {
  sideOffset?: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}) {
  const { open } = useFloatingContext();
  return (
    <div
      data-slot="floating-content"
      data-state={open ? "open" : "closed"}
      className={cn(
        position === "bottom-right" && "fixed bottom-0 right-0 z-50",
        position === "bottom-left" && "fixed bottom-0 left-0 z-50",
        position === "top-right" && "fixed top-0 right-0 z-50",
        position === "top-left" && "fixed top-0 left-0 z-50",
        "rounded-xl shadow-2xl",
        "data-[state=open]:opacity-100 data-[state=open]:scale-100 data-[state=open]:pointer-events-auto",
        "data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=closed]:pointer-events-none",
        "transition-all duration-300",
        className
      )}
      style={{ bottom: sideOffset }}
      {...props}
    />
  );
}

export { Floating, FloatingContent, FloatingTrigger };

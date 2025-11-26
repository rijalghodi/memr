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
  ...props
}: React.ComponentProps<"div"> & {
  sideOffset?: number;
}) {
  const { open } = useFloatingContext();

  return (
    <div
      data-slot="floating-content"
      data-state={open ? "open" : "closed"}
      className={cn(
        "fixed bottom-0 inset-x-0 z-50 w-screen max-w-5xl h-screen lg:max-h-[calc(100svh-2.75rem)] lg:hidden rounded-xl shadow-2xl",
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

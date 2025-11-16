"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { Button } from "./button";
import { Info, Trash } from "lucide-react";
import * as React from "react";

type ConfirmationOptions = {
  title?: string;
  message?: string;
  itemName?: string;
  onConfirm: () => Promise<void> | void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
};

type ConfirmationContextType = {
  confirm: (options: ConfirmationOptions) => void;
};

const ConfirmationContext = React.createContext<ConfirmationContextType | null>(
  null
);

export function useConfirmation() {
  const context = React.useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirmation must be used within ConfirmationProvider");
  }
  return context;
}

export function ConfirmationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmationOptions | null>(
    null
  );

  const confirm = React.useCallback((newOptions: ConfirmationOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  }, []);

  const handleConfirm = React.useCallback(async () => {
    if (!options) return;

    setLoading(true);
    try {
      await options.onConfirm();
      setIsOpen(false);
      setOptions(null);
    } catch (error) {
      // Error handling is expected to be done in the onConfirm callback
      console.error("Confirmation action failed:", error);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const handleCancel = React.useCallback(() => {
    if (!loading) {
      setIsOpen(false);
      setOptions(null);
    }
  }, [loading]);

  const contextValue = React.useMemo(
    () => ({
      confirm,
    }),
    [confirm]
  );

  const title = options?.title || "Confirm Action";
  const defaultMessage = options?.itemName
    ? `Are you sure you want to proceed with "${options.itemName}"?`
    : "Are you sure you want to proceed?";
  const message = options?.message || defaultMessage;
  const variant = options?.variant || "default";

  return (
    <ConfirmationContext.Provider value={contextValue}>
      {children}
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => !open && !loading && handleCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div>
              {variant === "destructive" ? (
                <div className="flex justify-center items-center h-12 w-12 rounded-full bg-destructive/10">
                  <Trash className="size-5 text-destructive" />
                </div>
              ) : (
                <div className="flex justify-center items-center h-12 w-12 rounded-full bg-primary/10">
                  <Info className="size-5 text-primary" />
                </div>
              )}
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex w-full">
            <AlertDialogCancel
              className="flex-1 rounded-sm"
              onClick={handleCancel}
              disabled={loading}
            >
              {options?.cancelLabel || "Cancel"}
            </AlertDialogCancel>
            <Button
              className="flex-1"
              color={variant === "destructive" ? "destructive" : "primary"}
              onClick={handleConfirm}
              disabled={loading}
            >
              {options?.confirmLabel || "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmationContext.Provider>
  );
}

import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({
  className,
  maxRows,
  onChange,
  ...props
}: React.ComponentProps<"textarea"> & { maxRows?: number }) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Get the scroll height (content height)
    const scrollHeight = textarea.scrollHeight;

    // Calculate line height
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10);

    // Calculate max height based on maxRows
    const maxHeight = maxRows ? maxRows * lineHeight : scrollHeight;

    // Set height to the smaller of scrollHeight or maxHeight
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Enable scrolling if content exceeds maxRows
    if (maxRows && scrollHeight > maxHeight) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  }, [maxRows]);

  // Adjust height on mount and when value changes
  React.useEffect(() => {
    adjustHeight();
  }, [adjustHeight, props.value]);

  // Handle onChange
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    adjustHeight();
  };

  return (
    <textarea
      ref={textareaRef}
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ",
        "dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-base",
        "shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed",
        "disabled:opacity-50 md:text-sm",
        "resize-none overflow-hidden",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  );
}

export { Textarea };

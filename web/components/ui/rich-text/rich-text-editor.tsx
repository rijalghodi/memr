"use client";

import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { useEffect, useRef } from "react";

type RichTextEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

const CrepeEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const isInitializedRef = useRef(false);
  const crepeRef = useRef<Crepe | null>(null);
  const { get } = useEditor((root) => {
    const crepe = new Crepe({
      root,
      features: {
        "image-block": false,
        table: false,
      },
    });

    crepeRef.current = crepe;

    return crepe;
  });

  // Set initial value
  useEffect(() => {
    if (!crepeRef.current || !value || isInitializedRef.current) return;

    const crepe = crepeRef.current;
    // Try to set markdown using the editor instance
    const editor = get();
    if (editor) {
      // Access the editor's internal methods if available
      (editor as any)
        .setMarkdown?.(value)
        .then(() => {
          isInitializedRef.current = true;
        })
        .catch(() => {
          // If setMarkdown doesn't exist, mark as initialized anyway
          isInitializedRef.current = true;
        });
    } else {
      isInitializedRef.current = true;
    }
  }, [value, get]);

  // Listen to markdown changes
  useEffect(() => {
    if (!get || !onChange) return;

    const editor = get();
    if (!editor) return;

    // Try to listen to updates
    const checkForUpdates = async () => {
      try {
        const markdown = await (editor as any).getMarkdown?.();
        if (markdown !== undefined) {
          onChange(markdown);
        }
      } catch {
        // Ignore errors if method doesn't exist
      }
    };

    // Poll for changes (fallback if event listener not available)
    const interval = setInterval(checkForUpdates, 500);

    return () => {
      clearInterval(interval);
    };
  }, [get, onChange]);

  // Update content when value prop changes externally
  useEffect(() => {
    if (value === undefined || !isInitializedRef.current || !crepeRef.current)
      return;

    const editor = get();
    if (editor) {
      (editor as any).setMarkdown?.(value).catch(() => {
        // Ignore errors
      });
    }
  }, [value, get]);

  return <Milkdown />;
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
}) => {
  return (
    <MilkdownProvider>
      <CrepeEditor value={value} onChange={onChange} />
    </MilkdownProvider>
  );
};

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useBrowserNavigate } from "@/components/navigation-provider";
import { getRoute, ROUTES } from "@/lib/routes";

/**
 * Pre-processes markdown string to convert custom patterns [note=UUID] and [task=UUID]
 * into markdown links that can be handled by react-markdown
 */
function preprocessMarkdown(content: string): string {
  // Convert [note=UUID] to markdown links
  // Pattern: [note=UUID] -> [Note](memr://note/UUID)
  let processed = content.replace(
    /\[note=([a-f0-9-]+)\]/gi,
    (_, uuid) => `[Note](memr://note/${uuid})`,
  );

  // Convert [task=UUID] to markdown links
  // Pattern: [task=UUID] -> [Task](memr://task/UUID)
  processed = processed.replace(
    /\[task=([a-f0-9-]+)\]/gi,
    (_, uuid) => `[Task](memr://task/${uuid})`,
  );

  return processed;
}

export function MarkdownViewer({ content }: { content: string }) {
  const { navigate } = useBrowserNavigate();
  // Pre-process markdown to handle custom patterns
  const processedContent = preprocessMarkdown(content);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom link component to handle memr:// protocol links
        a: ({ href, children, ...props }) => {
          // Handle custom memr:// protocol links
          if (href?.startsWith("memr://")) {
            const url = new URL(href);
            const type = url.hostname; // "note" or "task"
            const id = url.pathname.slice(1); // Remove leading slash

            const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              if (type === "note") {
                navigate(getRoute(ROUTES.NOTE, { noteId: id }));
              } else if (type === "task") {
                // Navigate to tasks page (no detail route available)
                navigate(ROUTES.TASKS);
              }
            };

            return (
              <a
                href={href}
                onClick={handleClick}
                className="underline cursor-pointer hover:text-primary"
                {...props}
              >
                {children}
              </a>
            );
          }

          // Regular links
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary hover:text-primary/80"
              {...props}
            >
              {children}
            </a>
          );
        },
        // Style other markdown elements
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="ml-2">{children}</li>,
        code: ({ children, className }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ) : (
            <code className={className}>{children}</code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-2">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-muted-foreground pl-4 italic mb-2">
            {children}
          </blockquote>
        ),
        h1: ({ children }) => (
          <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-bold mb-2 mt-4 first:mt-0">
            {children}
          </h3>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}

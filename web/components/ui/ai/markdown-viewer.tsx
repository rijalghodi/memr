import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";

import {
  COLLECTION_TITLE_FALLBACK,
  NOTE_TITLE_FALLBACK,
  PROJECT_TITLE_FALLBACK,
  TASK_TITLE_FALLBACK,
} from "@/lib/constant";
import { getRoute, ROUTES } from "@/lib/routes";
import { useGetCollection } from "@/service/local/api-collection";
import { useGetNote } from "@/service/local/api-note";
import { useGetProject } from "@/service/local/api-project";
import { useGetTask } from "@/service/local/api-task";

/**
 * Pre-processes markdown string to convert custom patterns [entity=UUID]
 * into markdown links that can be handled by react-markdown
 * Uses a format that ReactMarkdown will definitely parse: /memr/type/id
 */
function preprocessMarkdown(content: string): string {
  // Convert [note=UUID] to markdown links
  // Pattern: [note=UUID] -> [Loading...](/memr/note/UUID)
  let processed = content.replace(
    /\[note=([a-f0-9-]+)\]/gi,
    (_, uuid) => `[Loading...](/memr/note/${uuid})`
  );

  // Convert [task=UUID] to markdown links
  // Pattern: [task=UUID] -> [Loading...](/memr/task/UUID)
  processed = processed.replace(
    /\[task=([a-f0-9-]+)\]/gi,
    (_, uuid) => `[Loading...](/memr/task/${uuid})`
  );

  // Convert [collection=UUID] to markdown links
  // Pattern: [collection=UUID] -> [Loading...](/memr/collection/UUID)
  processed = processed.replace(
    /\[collection=([a-f0-9-]+)\]/gi,
    (_, uuid) => `[Loading...](/memr/collection/${uuid})`
  );

  // Convert [project=UUID] to markdown links
  // Pattern: [project=UUID] -> [Loading...](/memr/project/UUID)
  processed = processed.replace(
    /\[project=([a-f0-9-]+)\]/gi,
    (_, uuid) => `[Loading...](/memr/project/${uuid})`
  );

  return processed;
}

/**
 * Component that renders entity links with fetched titles
 */
function EntityLink({
  type,
  id,
}: {
  type: "note" | "task" | "collection" | "project";
  id: string;
}) {
  const noteData = useGetNote(type === "note" ? id : undefined);
  const taskData = useGetTask(type === "task" ? id : undefined);
  const collectionData = useGetCollection(type === "collection" ? id : undefined);
  const projectData = useGetProject(type === "project" ? id : undefined);

  const title = useMemo(() => {
    switch (type) {
      case "note":
        return noteData.data?.title || NOTE_TITLE_FALLBACK;
      case "task":
        return taskData.data?.title || TASK_TITLE_FALLBACK;
      case "collection":
        return collectionData.data?.title || COLLECTION_TITLE_FALLBACK;
      case "project":
        return projectData.data?.title || PROJECT_TITLE_FALLBACK;
      default:
        return "Deleted";
    }
  }, [
    type,
    noteData.data?.title,
    taskData.data?.title,
    collectionData.data?.title,
    projectData.data?.title,
  ]);

  const href = useMemo(() => {
    switch (type) {
      case "note":
        return getRoute(ROUTES.NOTE, { noteId: id });
      case "task":
        return ROUTES.TASKS; // Tasks don't have detail route
      case "collection":
        return getRoute(ROUTES.COLLECTION, { collectionId: id });
      case "project":
        return getRoute(ROUTES.PROJECT, { projectId: id });
      default:
        return "#";
    }
  }, [type, id]);

  return (
    <Link to={href} className="underline cursor-pointer hover:text-primary">
      {title}
    </Link>
  );
}

export function MarkdownViewer({ content }: { content: string }) {
  // Pre-process markdown to handle custom patterns
  const processedContent = preprocessMarkdown(content);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Custom link component to handle memr:// protocol links
        a: ({ href, children, ...props }) => {
          // Handle custom /memr/type/id format links
          if (href?.startsWith("/memr/")) {
            const parts = href.split("/");
            if (parts.length >= 4) {
              const type = parts[2] as "note" | "task" | "collection" | "project";
              const id = parts[3];

              // Render EntityLink component for entity references
              return <EntityLink type={type} id={id} />;
            }
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
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li className="ml-2">{children}</li>,
        code: ({ children, className }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
          ) : (
            <code className={className}>{children}</code>
          );
        },
        pre: ({ children }) => (
          <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-2">{children}</pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-muted-foreground pl-4 italic mb-2">
            {children}
          </blockquote>
        ),
        h1: ({ children }) => (
          <h1 className="text-xl font-semibold mb-2 mt-4 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold mb-2 mt-4 first:mt-0">{children}</h3>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}

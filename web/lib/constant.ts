export const ACCESS_TOKEN_KEY = "memr.access-token";
export const REFRESH_TOKEN_KEY = "memr.refresh-token";

export const SYNC_INTERVAL = process.env.NEXT_PUBLIC_SYNC_INTERVAL
  ? parseInt(process.env.NEXT_PUBLIC_SYNC_INTERVAL)
  : 20 * 1000;
export const SYNC_GRACE_PERIOD = process.env.NEXT_PUBLIC_SYNC_GRACE_PERIOD
  ? parseInt(process.env.NEXT_PUBLIC_SYNC_GRACE_PERIOD)
  : 5 * 1000;
export const AUTOSAVE_INTERVAL = process.env.NEXT_PUBLIC_AUTOSAVE_INTERVAL
  ? parseInt(process.env.NEXT_PUBLIC_AUTOSAVE_INTERVAL)
  : 1 * 1000;

export const NOTE_TITLE_FALLBACK = "Untitled Note";
export const NOTE_CONTENT_EXCERPT_FALLBACK = "No additional content";

export const TASK_TITLE_FALLBACK = "Untitled Task";
export const TASK_DESCRIPTION_EXCERPT_FALLBACK = "No additional description";

export const COLLECTION_TITLE_FALLBACK = "Untitled Collection";

export const PROJECT_TITLE_FALLBACK = "Untitled Project";

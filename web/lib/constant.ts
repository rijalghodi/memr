// Auth cookie keys
export const ACCESS_TOKEN_KEY = "memr.access-token";
export const REFRESH_TOKEN_KEY = "memr.refresh-token";

// Local storage keys
export const SESSION_TABS_KEY = "memr.session-tabs";

// IndexDB settings keys
export const CURRENT_USER_ID_KEY = "currentUserId";
export const LAST_SYNC_TIME_KEY = "lastSyncTime";

// Sync interval
export const SYNC_INTERVAL = import.meta.env.VITE_SYNC_INTERVAL
  ? parseInt(import.meta.env.VITE_SYNC_INTERVAL)
  : 20 * 1000;
export const SYNC_GRACE_PERIOD = import.meta.env.VITE_SYNC_GRACE_PERIOD
  ? parseInt(import.meta.env.VITE_SYNC_GRACE_PERIOD)
  : 5 * 1000;
export const AUTOSAVE_INTERVAL = import.meta.env.VITE_AUTOSAVE_INTERVAL
  ? parseInt(import.meta.env.VITE_AUTOSAVE_INTERVAL)
  : 1 * 1000;

// Fallback values
export const NOTE_TITLE_FALLBACK = "Untitled Note";
export const NOTE_CONTENT_EXCERPT_FALLBACK = "No additional content";

export const TASK_TITLE_FALLBACK = "Untitled Task";
export const TASK_DESCRIPTION_EXCERPT_FALLBACK = "No additional description";

export const COLLECTION_TITLE_FALLBACK = "Untitled Collection";

export const PROJECT_TITLE_FALLBACK = "Untitled Project";

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

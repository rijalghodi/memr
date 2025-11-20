/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_OAUTH_CLIENT_ID: string;
  readonly VITE_GOOGLE_OAUTH_REDIRECT_URI: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_URL: string;
  readonly VITE_SYNC_INTERVAL?: string;
  readonly VITE_SYNC_GRACE_PERIOD?: string;
  readonly VITE_AUTOSAVE_INTERVAL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLEVERTAP_ACCOUNT_ID?: string;
  readonly VITE_CLEVERTAP_REGION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

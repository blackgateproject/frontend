/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INFURA_PROJECT_ID: string;
  // add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

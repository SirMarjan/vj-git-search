/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITLAB_BASE_URL: string
  readonly VITE_GITLAB_PRIVATE_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

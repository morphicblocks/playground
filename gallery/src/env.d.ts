interface ImportMetaEnv {
  readonly PUBLIC_SITE_NAME?: string;
  readonly PUBLIC_REPO_SLUG?: string;
  readonly PUBLIC_GITHUB_URL?: string;
  readonly PUBLIC_DOCS_URL?: string;
  readonly PUBLIC_LANDING_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

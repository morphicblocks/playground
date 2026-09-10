interface ImportMetaEnv {
  readonly PUBLIC_SITE_NAME?: string;
  readonly PUBLIC_REPO_SLUG?: string;
  readonly PUBLIC_GITHUB_URL?: string;
  readonly PUBLIC_DOCS_URL?: string;
  readonly PUBLIC_LANDING_URL?: string;
  readonly PUBLIC_UNIVERSITY?: string;
  readonly PUBLIC_UNIVERSITY_URL?: string;
  readonly PUBLIC_IMPRINT_URL?: string;
  readonly PUBLIC_PRIVACY_URL?: string;
  readonly PUBLIC_DISCLAIMER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Single source for env-driven values (see .env.example at the repo root).
 * Per-app links are derived from the repo coordinates + the app id, so they
 * never have to be stored in apps.json.
 */
const env = import.meta.env;

// Undefined when a variable is unset or empty, so callers can skip the link
// entirely rather than rendering a dead one.
const link = (value?: string) => value || undefined;

export const site = {
  name: env.PUBLIC_SITE_NAME ?? '',
  repoSlug: env.PUBLIC_REPO_SLUG ?? '',
  links: {
    github: link(env.PUBLIC_GITHUB_URL),
    docs: link(env.PUBLIC_DOCS_URL),
    landing: link(env.PUBLIC_LANDING_URL),
  },
  /**
   * Required on every university web presence: imprint, privacy policy and
   * disclaimer. They point at the university's own pages, so they are plain
   * env-driven URLs like the rest.
   */
  legal: {
    imprint: link(env.PUBLIC_IMPRINT_URL),
    privacy: link(env.PUBLIC_PRIVACY_URL),
    disclaimer: link(env.PUBLIC_DISCLAIMER_URL),
  },
};

/** Absolute http(s) URLs point off-site. */
export function isExternal(href?: string): boolean {
  return !!href && /^https?:\/\//i.test(href);
}

/** Spread onto an <a> so off-site links open in a new tab. */
export function externalAttrs(href?: string) {
  return isExternal(href)
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};
}

/** Links for one app, all derived from its immutable `id`. */
export function appLinks(id: string) {
  return {
    /** Where the built app is served inside the playground. */
    open: `/${id}/`,
    /** Browse the source folder on GitHub; undefined without a repo URL. */
    source: site.links.github
      ? `${site.links.github}/tree/main/apps/${id}`
      : undefined,
    /** Copy-paste command that pulls just this app's folder. */
    degit: site.repoSlug
      ? `bunx degit ${site.repoSlug}/apps/${id} ${id}`
      : undefined,
  };
}

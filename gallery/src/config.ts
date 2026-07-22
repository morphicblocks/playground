/**
 * Single source for env-driven values (see .env.example at the repo root).
 * Per-app links are derived from the repo coordinates + the app id, so they
 * never have to be stored in apps.json.
 */
const env = import.meta.env;

export const site = {
  name: env.PUBLIC_SITE_NAME ?? '',
  repoSlug: env.PUBLIC_REPO_SLUG ?? '',
  links: {
    github: env.PUBLIC_GITHUB_URL ?? '#',
    docs: env.PUBLIC_DOCS_URL ?? '#',
    landing: env.PUBLIC_LANDING_URL ?? '#',
  },
};

/** Links for one app, all derived from its immutable `id`. */
export function appLinks(id: string) {
  return {
    /** Where the built app is served inside the playground. */
    open: `/${id}/`,
    /** Browse the source folder on GitHub. */
    source: `${site.links.github}/tree/main/apps/${id}`,
    /** Copy-paste command that pulls just this app's folder. */
    degit: `bunx degit ${site.repoSlug}/apps/${id} ${id}`,
  };
}

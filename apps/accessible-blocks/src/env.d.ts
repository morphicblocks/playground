// Mode stylesheets arrive as text (see scripts/build.ts); other stylesheets
// are only imported for their effect.
declare module "*.css" {
  const css: string;
  export default css;
}

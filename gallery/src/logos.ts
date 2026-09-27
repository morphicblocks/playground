/**
 * Every app keeps its logo at apps/<id>/public/logo.svg. The gallery bundles
 * them, so each card can show its app's logo.
 */
const files = import.meta.glob('../../apps/*/public/logo.svg', {
	query: '?url',
	import: 'default',
	eager: true,
}) as Record<string, string>;

export const logoOf = (id: string): string | undefined => files[`../../apps/${id}/public/logo.svg`];

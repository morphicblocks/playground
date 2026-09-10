import type { APIRoute } from 'astro';

// Served at /robots.txt. The gallery is a single page and the example apps are
// copied into dist/<id>/ after the Astro build, so there is no sitemap to
// advertise here.
export const GET: APIRoute = () =>
	new Response(['User-agent: *', 'Allow: /'].join('\n') + '\n', {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});

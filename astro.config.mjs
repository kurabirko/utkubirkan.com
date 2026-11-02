// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Used for the canonical URL, og:url and the JSON-LD Person url.
	site: 'https://utkubirkan.com',
	build: {
		// The CSS is a few KB on a single page, so inline it: the page paints
		// without waiting for a stylesheet request. Revisit if the site grows
		// more pages (each would repeat it) or the CSS grows large.
		inlineStylesheets: 'always',
	},
	// Downloaded at build time and served from the site; no requests to Google.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'EB Garamond',
			cssVariable: '--font-eb-garamond',
			weights: [400, 500, 600],
			styles: ['normal', 'italic'],
			// latin-ext covers Turkish letters (ı, İ, ğ, ş) in names and institutions
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['Iowan Old Style', 'Garamond', 'Georgia', 'serif'],
		},
		{
			provider: fontProviders.google(),
			name: 'Jost',
			cssVariable: '--font-jost',
			// A variable range rather than fixed weights, so the name can thin
			// from 900 to 750 as it shrinks; light for the footer.
			weights: ['300 900'],
			styles: ['normal'],
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['Futura', 'Avenir Next', 'Century Gothic', 'sans-serif'],
		},
	],
});

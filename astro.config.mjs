// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Downloaded at build time and served from the site; no requests to Google.
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'EB Garamond',
			cssVariable: '--font-eb-garamond',
			weights: [400, 600],
			styles: ['normal', 'italic'],
			// latin-ext covers Turkish letters (ı, İ, ğ, ş) in names and institutions
			subsets: ['latin', 'latin-ext'],
			fallbacks: ['Iowan Old Style', 'Garamond', 'Georgia', 'serif'],
		},
	],
});

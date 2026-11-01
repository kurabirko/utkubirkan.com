// Prints the built CV to dist/utku-birkan-cv.pdf with headless Chrome, using
// the site's own print styles, so the download matches what printing the page
// gives. Runs after `astro build` (see the build script in package.json).
//
// The page is printed from a copy of dist/ served on a local port (its asset
// paths are root-relative, so file:// won't do). The copy pins the paper to A4:
// a PDF needs a size, while the site itself prints on whatever paper the
// reader uses.
//
// Without Chrome the PDF is skipped with a warning, so local builds still
// work; set REQUIRE_PDF=1 (as CI does) to make that an error.

import { existsSync } from 'node:fs';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const dist = resolve(import.meta.dir, '../dist');
const output = join(dist, 'utku-birkan-cv.pdf');

const chrome = [
	process.env.CHROME_PATH,
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/usr/bin/google-chrome',
	'/usr/bin/google-chrome-stable',
	'/usr/bin/chromium',
	'/usr/bin/chromium-browser',
].find((path) => path && existsSync(path));

if (!chrome) {
	const message = 'build-pdf: Chrome not found (set CHROME_PATH); skipping the PDF.';
	if (process.env.REQUIRE_PDF) {
		console.error(message);
		process.exit(1);
	}
	console.warn(message);
	process.exit(0);
}

const staging = await mkdtemp(join(tmpdir(), 'cv-pdf-'));
try {
	await cp(dist, staging, { recursive: true });
	const page = join(staging, 'index.html');
	const html = await Bun.file(page).text();
	await Bun.write(page, html.replace('</head>', '<style>@page { size: A4; }</style></head>'));

	const server = Bun.serve({
		port: 0,
		async fetch(request) {
			let path = new URL(request.url).pathname;
			if (path.endsWith('/')) path += 'index.html';
			const file = Bun.file(join(staging, path));
			return (await file.exists()) ? new Response(file) : new Response('Not found', { status: 404 });
		},
	});

	try {
		const chromeProcess = Bun.spawn(
			[
				chrome,
				'--headless=new',
				'--disable-gpu',
				'--no-sandbox',
				'--no-pdf-header-footer',
				// Give the web fonts time to load before printing.
				'--virtual-time-budget=10000',
				`--print-to-pdf=${output}`,
				server.url.href,
			],
			{ stdout: 'ignore', stderr: 'ignore' },
		);
		const code = await chromeProcess.exited;
		if (code !== 0 || !existsSync(output)) {
			console.error(`build-pdf: Chrome exited with ${code} and no PDF was written.`);
			process.exit(1);
		}
		const size = Bun.file(output).size;
		console.log(`build-pdf: wrote dist/utku-birkan-cv.pdf (${Math.round(size / 1024)} KB)`);
	} finally {
		server.stop(true);
	}
} finally {
	await rm(staging, { recursive: true, force: true });
}

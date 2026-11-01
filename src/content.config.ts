import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Year and month, e.g. "2022-09". Formatted for display in src/lib/date.ts.
const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected YYYY-MM');

const link = z.object({
	label: z.string(),
	href: z.string(),
});

const profile = defineCollection({
	loader: file('src/content/profile.yaml'),
	schema: z.object({
		name: z.string(),
		title: z.string(),
		location: z.string(),
		summary: z.string().optional(),
		// Your name as it appears in citations, highlighted in the publications list.
		citationName: z.string().optional(),
		links: z.array(link),
	}),
});

const experience = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
	schema: z.object({
		company: z.string(),
		role: z.string(),
		location: z.string(),
		start: yearMonth,
		end: yearMonth.optional(), // omit for a current position
	}),
});

const education = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/education' }),
	schema: z.object({
		school: z.string(),
		degree: z.string(),
		honors: z.string().optional(),
		gpa: z.string().optional(),
		location: z.string(),
		start: yearMonth.optional(),
		end: yearMonth,
		project: link.optional(),
	}),
});

const publications = defineCollection({
	loader: file('src/content/publications.yaml'),
	schema: z.object({
		authors: z.array(z.string()),
		year: z.number().int(),
		title: z.string(),
		venue: z.string(),
		pages: z.string().optional(),
		publisher: z.string().optional(),
		doi: z.string().optional(),
	}),
});

const skills = defineCollection({
	loader: file('src/content/skills.yaml'),
	schema: z.object({
		name: z.string(),
		order: z.number().int(),
		items: z.array(z.string()),
	}),
});

export const collections = { profile, experience, education, publications, skills };

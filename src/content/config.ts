import { z, defineCollection } from "astro:content";

const experience = defineCollection({
  type: "content",
  schema: z.object({
    company: z.object({
      name: z.string(),
      link: z.string(),
    }),
    role: z.string(),
    startDate: z.coerce.date(),
    endDate: z.optional(z.coerce.date()),
    tags: z.array(z.string()).optional(),
    links: z
      .array(
        z.object({
          text: z.string(),
          href: z.string(),
        })
      )
      .optional(),
  }),
});

const education = defineCollection({
  type: "content",
  schema: z.object({
    school: z.string(),
    degree: z.string(),
    gpa: z.number(),
    graduationDate: z.coerce.date(),
  }),
});

export const collections = { experience, education };

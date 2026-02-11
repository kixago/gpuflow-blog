import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { languages } from "./i18n/locales";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      // Core fields
      title: z.string(),
      description: z.string(),
      excerpt: z.string().optional(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),

      // Images
      heroImage: image().optional(),
      heroImageAlt: z.string().optional(),

      // i18n - THIS IS THE CRITICAL FIELD
      locale: z.enum(Object.keys(languages) as [string, ...string[]]),

      // Organization
      category: z
        .enum([
          "tutorials",
          "pricing",
          "comparisons",
          "news",
          "guides",
          "tips",
          "benchmarks",
          "case-studies",
        ])
        .default("guides"),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),

      // Author
      author: z.string().default("GPUFlow Team"),

      // Optional FAQ schema
      faq: z
        .array(
          z.object({
            question: z.string(),
            answer: z.string(),
          }),
        )
        .optional(),
    }),
});

export const collections = { blog };

import { defineConfig, defineCollection, s } from 'velite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

/* ------------------------------------------------------------------ *
 * Shared field vocabulary.
 * These are the primitives every audit pass in scripts/ relies on.
 * ------------------------------------------------------------------ */

const PERSONAS = ['junior', 'mid', 'senior', 'lead', 'cto'] as const;
const VOLATILITY = ['low', 'medium', 'high'] as const;

/** w1.m03.b02 — week, module, bullet. Stable across renames; used for links. */
const lessonId = s.string().regex(/^w[1-4]\.m\d{2}\.b\d{2}$/, {
  message: 'id must look like w1.m03.b02',
});

const source = s.object({
  url: s.string().url(),
  title: s.string().min(3),
  publisher: s.string().min(2),
  /** When a human or the researcher agent last actually opened this URL. */
  accessedOn: s.isodate(),
});

const check = s.object({
  q: s.string().min(8),
  a: s.string().min(2),
  hint: s.string().optional(),
});

/* ------------------------------------------------------------------ *
 * Lessons — one page per agenda bullet.
 * ------------------------------------------------------------------ */

const lessons = defineCollection({
  name: 'Lesson',
  pattern: 'lessons/**/*.mdx',
  schema: s
    .object({
      id: lessonId,
      title: s.string().min(4).max(90),
      slug: s.path(),
      week: s.number().int().min(1).max(4),
      weekTitle: s.string(),
      module: s.number().int().min(1),
      moduleTitle: s.string(),
      bullet: s.number().int().min(1),
      /** The one-line TL;DR. Reused verbatim on cards, in search, and in the wiki. */
      summary: s.string().min(20).max(240),
      personas: s.array(s.enum(PERSONAS)).min(1),
      prerequisites: s.array(lessonId).default([]),
      related: s.array(lessonId).default([]),
      tags: s.array(s.string()).default([]),
      /** Wiki terms this lesson introduces. Stage 4 harvests these into /wiki. */
      defines: s.array(s.string()).default([]),
      sources: s.array(source).default([]),
      verifiedOn: s.isodate(),
      volatility: s.enum(VOLATILITY),
      estMinutes: s.number().int().min(2).max(90).default(10),
      /** Promoted into the curated /crash-course path, in this order. */
      crashCourse: s.number().int().min(1).optional(),
      checks: s.array(check).default([]),
      labs: s.array(s.string()).default([]),
      draft: s.boolean().default(false),
      content: s.mdx(),
      raw: s.raw(),
      toc: s.toc(),
      metadata: s.metadata(),
    })
    .superRefine((doc, ctx) => {
      // The fact policy, enforced at build time: anything that can rot needs a
      // traceable source. Conceptual (low-volatility) pages may reason freely.
      if (doc.volatility !== 'low' && doc.sources.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['sources'],
          message: `${doc.id}: volatility "${doc.volatility}" requires at least one source`,
        });
      }
      if (!doc.draft && doc.checks.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['checks'],
          message: `${doc.id}: a published lesson needs at least one check for understanding`,
        });
      }
    })
    .transform((doc) => ({
      ...doc,
      // /deep-dive/w1/m01/b02
      permalink: `/deep-dive/w${doc.week}/m${String(doc.module).padStart(2, '0')}/b${String(doc.bullet).padStart(2, '0')}`,
    })),
});

/* ------------------------------------------------------------------ *
 * Wiki — A–Z concepts. One canonical definition per term, plus its TL;DR.
 * ------------------------------------------------------------------ */

const wiki = defineCollection({
  name: 'WikiEntry',
  pattern: 'wiki/**/*.mdx',
  schema: s
    .object({
      term: s.string().min(1).max(80),
      slug: s.slug('wiki'),
      aliases: s.array(s.string()).default([]),
      /** The TL;DR: one sentence a tired reader can hold in their head. */
      summary: s.string().min(10).max(280),
      analogy: s.string().max(400).optional(),
      category: s.string(),
      relatedTerms: s.array(s.string()).default([]),
      /** Lessons that teach this term properly. */
      lessons: s.array(lessonId).default([]),
      sources: s.array(source).default([]),
      verifiedOn: s.isodate(),
      content: s.mdx(),
    })
    .transform((doc) => ({
      ...doc,
      permalink: `/wiki/${doc.slug}`,
      letter: doc.term.charAt(0).toUpperCase(),
    })),
});

/* ------------------------------------------------------------------ *
 * Gotchas — the reference site's four-part shape, kept because it works.
 * ------------------------------------------------------------------ */

const gotchas = defineCollection({
  name: 'Gotcha',
  pattern: 'gotchas/**/*.mdx',
  schema: s
    .object({
      id: s.string().regex(/^g\d{3}$/),
      title: s.string().min(6).max(110),
      slug: s.slug('gotchas'),
      category: s.string(),
      severity: s.enum(['low', 'medium', 'high', 'critical']),
      whatGoesWrong: s.string().min(30),
      whyItHappens: s.string().min(30),
      howToDetect: s.string().min(20),
      fix: s.string().min(20),
      relatedLessons: s.array(lessonId).default([]),
      sources: s.array(source).default([]),
      verifiedOn: s.isodate(),
      content: s.mdx(),
    })
    .transform((doc) => ({ ...doc, permalink: `/tools/gotchas#${doc.id}` })),
});

/* ------------------------------------------------------------------ *
 * Tools & setup — install/configure pages, deliberately vendor-plural.
 * ------------------------------------------------------------------ */

const tools = defineCollection({
  name: 'ToolPage',
  pattern: 'tools/**/*.mdx',
  schema: s
    .object({
      id: s.string(),
      title: s.string().min(3).max(90),
      slug: s.slug('tools'),
      summary: s.string().min(20).max(240),
      category: s.enum(['harness', 'runtime', 'protocol', 'observability', 'setup']),
      order: s.number().int().default(50),
      sources: s.array(source).min(1),
      verifiedOn: s.isodate(),
      volatility: s.enum(VOLATILITY).default('high'),
      relatedLessons: s.array(lessonId).default([]),
      content: s.mdx(),
      toc: s.toc(),
    })
    .transform((doc) => ({ ...doc, permalink: `/tools/${doc.slug}` })),
});

/* ------------------------------------------------------------------ *
 * Recipes — "how to actually do it", shown across 2–3 harnesses.
 * ------------------------------------------------------------------ */

const recipes = defineCollection({
  name: 'Recipe',
  pattern: 'recipes/**/*.mdx',
  schema: s
    .object({
      id: s.string().regex(/^r\d{3}$/),
      title: s.string().min(6).max(110),
      slug: s.slug('recipes'),
      summary: s.string().min(20).max(240),
      problem: s.string().min(20),
      /** Vendor-neutral by policy: a recipe shows at least two harnesses. */
      harnesses: s.array(s.string()).min(2),
      difficulty: s.enum(['starter', 'working', 'advanced']),
      estMinutes: s.number().int().min(2).max(240).default(15),
      tags: s.array(s.string()).default([]),
      relatedLessons: s.array(lessonId).default([]),
      sources: s.array(source).default([]),
      verifiedOn: s.isodate(),
      content: s.mdx(),
    })
    .transform((doc) => ({ ...doc, permalink: `/agents/recipes/${doc.slug}` })),
});

/* ------------------------------------------------------------------ *
 * Labs — the hands-on half. Referenced by id from lessons.
 * ------------------------------------------------------------------ */

const labs = defineCollection({
  name: 'Lab',
  pattern: 'labs/**/*.mdx',
  schema: s
    .object({
      id: s.string().regex(/^l\d{3}$/),
      title: s.string().min(6).max(110),
      slug: s.slug('labs'),
      goal: s.string().min(20).max(300),
      estMinutes: s.number().int().min(2).max(180).default(15),
      difficulty: s.enum(['starter', 'working', 'advanced']),
      prerequisites: s.array(s.string()).default([]),
      /** What the reader should observe if it worked. Labs must be falsifiable. */
      successLooksLike: s.string().min(20),
      content: s.mdx(),
    })
    .transform((doc) => ({ ...doc, permalink: `/labs/${doc.slug}` })),
});

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { lessons, wiki, gotchas, tools, recipes, labs },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['heading-anchor'] } }],
      [
        rehypePrettyCode,
        {
          // Dual themes emit --shiki-light / --shiki-dark custom properties, so
          // code follows the theme swap without a second render. See globals.css.
          theme: { light: 'github-light', dark: 'github-dark-dimmed' },
          keepBackground: false,
          defaultLang: 'text',
        },
      ],
    ],
  },
});

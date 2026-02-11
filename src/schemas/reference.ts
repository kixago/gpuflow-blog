// ============================================
// GPUFLOW SCHEMA REFERENCE
// ============================================
// Central configuration and schema builder functions
// Based on: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
// Schema.org spec: https://schema.org
// ============================================

// ============================================
// SITE CONFIGURATION
// Update these values as your business grows
// ============================================
export const SITE_CONFIG = {
  name: "GPUFlow",
  url: "https://gpuflow.app",
  logo: "https://gpuflow.app/logo.png", // Update path if different
  description:
    "Your guide to the decentralized GPU marketplace. Rent GPUs for AI training, gaming, rendering, or any compute workload.",
  foundingDate: "2025",
  email: "hello@gpuflow.app",

  // Add these as you create social profiles
  social: {
    // twitter: 'https://twitter.com/gpuflow',
    // github: 'https://github.com/gpuflow',
    // linkedin: 'https://linkedin.com/company/gpuflow',
    // discord: 'https://discord.gg/gpuflow',
  },

  // Related properties
  docsUrl: "https://docs.gpuflow.app",
  blogPath: "/blog",
} as const;

// ============================================
// 1. ORGANIZATION SCHEMA (Root Entity)
// https://developers.google.com/search/docs/appearance/structured-data/organization
// ============================================
// This is the ROOT of your knowledge graph.
// All other schemas reference back to this.
// ============================================
export const organizationSchema = {
  "@type": "Organization",
  "@id": `${SITE_CONFIG.url}/#organization`,
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.url,
  logo: {
    "@type": "ImageObject",
    "@id": `${SITE_CONFIG.url}/#logo`,
    url: SITE_CONFIG.logo,
    contentUrl: SITE_CONFIG.logo,
    caption: SITE_CONFIG.name,
    // Google recommends 600x60 for organization logos
    // Update these if your logo has different dimensions
    width: 600,
    height: 60,
  },
  image: { "@id": `${SITE_CONFIG.url}/#logo` },
  description: SITE_CONFIG.description,
  email: SITE_CONFIG.email,
  foundingDate: SITE_CONFIG.foundingDate,
  // Uncomment and add URLs as you create social profiles:
  // sameAs: [
  //   'https://twitter.com/gpuflow',
  //   'https://github.com/gpuflow',
  //   'https://linkedin.com/company/gpuflow',
  // ],
};

// ============================================
// 2. WEBSITE SCHEMA
// https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
// ============================================
// Describes your website as a whole.
// Links back to Organization as publisher.
// ============================================
export const webSiteSchema = {
  "@type": "WebSite",
  "@id": `${SITE_CONFIG.url}/#website`,
  url: SITE_CONFIG.url,
  name: SITE_CONFIG.name,
  description: SITE_CONFIG.description,
  publisher: { "@id": `${SITE_CONFIG.url}/#organization` },
  // Uncomment if you add site search later:
  // potentialAction: {
  //   '@type': 'SearchAction',
  //   target: {
  //     '@type': 'EntryPoint',
  //     urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
  //   },
  //   'query-input': 'required name=search_term_string',
  // },
  inLanguage: "en-US",
};

// ============================================
// 3. WEBPAGE SCHEMA (Per-Page)
// https://schema.org/WebPage
// ============================================
// Every page gets one of these.
// Links to WebSite and Organization.
// ============================================
export function createWebPageSchema({
  url,
  title,
  description,
  datePublished,
  dateModified,
}: {
  url: string;
  title: string;
  description: string;
  datePublished?: Date;
  dateModified?: Date;
}) {
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url: url,
    name: title,
    description: description,
    isPartOf: { "@id": `${SITE_CONFIG.url}/#website` },
    about: { "@id": `${SITE_CONFIG.url}/#organization` },
    ...(datePublished && { datePublished: datePublished.toISOString() }),
    ...(dateModified && { dateModified: dateModified.toISOString() }),
    inLanguage: "en-US",
  };
}

// ============================================
// 4. BREADCRUMB SCHEMA
// https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
// ============================================
// Shows navigation path in search results.
// Example: Home > Blog > Article Title
// ============================================
export function createBreadcrumbSchema(
  url: string,
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ============================================
// 5. ARTICLE SCHEMA (Blog Posts)
// https://developers.google.com/search/docs/appearance/structured-data/article
// ============================================
// For blog posts and articles.
// Links to WebPage and Organization.
// ============================================
export function createArticleSchema({
  url,
  title,
  description,
  image,
  datePublished,
  dateModified,
  authorName = "GPUFlow Team",
}: {
  url: string;
  title: string;
  description: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  authorName?: string;
}) {
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    isPartOf: { "@id": `${url}#webpage` },
    headline: title,
    description: description,
    image: {
      "@type": "ImageObject",
      url: image,
      // Google recommends 1200x630 for article images
      width: 1200,
      height: 630,
    },
    datePublished: datePublished.toISOString(),
    dateModified: (dateModified || datePublished).toISOString(),
    author: {
      "@type": "Organization",
      name: authorName,
      url: SITE_CONFIG.url,
    },
    publisher: { "@id": `${SITE_CONFIG.url}/#organization` },
    mainEntityOfPage: { "@id": `${url}#webpage` },
    inLanguage: "en-US",
  };
}

// ============================================
// 6. FAQ SCHEMA (For Posts with FAQs)
// https://developers.google.com/search/docs/appearance/structured-data/faqpage
// ============================================
// Generates FAQ rich results in search.
// Only use on pages that genuinely have FAQs.
// ============================================
export function createFAQSchema(
  url: string,
  questions: Array<{ question: string; answer: string }>,
) {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    isPartOf: { "@id": `${url}#webpage` },
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

// ============================================
// 7. HOWTO SCHEMA (For Tutorial Posts)
// https://developers.google.com/search/docs/appearance/structured-data/how-to
// ============================================
// For step-by-step guides and tutorials.
// Example: "How to Rent a GPU on GPUFlow"
// ============================================
export function createHowToSchema({
  url,
  title,
  description,
  image,
  totalTime,
  steps,
}: {
  url: string;
  title: string;
  description: string;
  image?: string;
  totalTime?: string; // ISO 8601 duration, e.g., "PT30M" = 30 minutes
  steps: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
}) {
  return {
    "@type": "HowTo",
    "@id": `${url}#howto`,
    isPartOf: { "@id": `${url}#webpage` },
    name: title,
    description: description,
    ...(image && { image: image }),
    ...(totalTime && { totalTime: totalTime }),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}

// ============================================
// 8. SCHEMA GRAPH BUILDER
// ============================================
// Combines multiple schemas into a single @graph.
// This is what Google recommends for connected schemas.
// ============================================
export function createSchemaGraph(schemas: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": schemas,
  };
}

// ============================================
// HELPER: Generate Blog Post Breadcrumbs
// ============================================
export function createBlogBreadcrumbs(postTitle: string, postUrl: string) {
  return [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Blog", url: `${SITE_CONFIG.url}${SITE_CONFIG.blogPath}` },
    { name: postTitle, url: postUrl },
  ];
}

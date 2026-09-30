import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { promises as fs } from "fs";
import { join } from "path";
import matter from "gray-matter";

const categoryLabels = /** @type {Record<string, string>} */ ({
  tutorials: "Tutorials",
  pricing: "Pricing",
  comparisons: "Comparisons",
  news: "News",
  guides: "Guides",
  tips: "Tips",
  benchmarks: "Benchmarks",
  "case-studies": "Case Studies",
});

function generateLlmsTxt() {
  return {
    name: "generate-llms-txt",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const contentDir = join(process.cwd(), "src/content/blog/en");
        const files = await fs.readdir(contentDir);

        const posts = [];

        for (const file of files) {
          if (!file.endsWith(".md") && !file.endsWith(".mdx")) continue;
          const raw = await fs.readFile(join(contentDir, file), "utf-8");
          const { data } = matter(raw);
          if (data.draft) continue;
          const slug = file.replace(/\.(md|mdx)$/, "");
          posts.push({
            title: data.title,
            description: data.excerpt || data.description,
            category: data.category || "guides",
            pubDate: data.pubDate,
            url: `https://blog.gpuflow.app/en/${slug}/`,
          });
        }

        // Sort newest first
        posts.sort(
          (a, b) =>
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
        );

        // Group by category
        const grouped = /** @type {Record<string, typeof posts>} */ ({});
        for (const post of posts) {
          const cat = post.category;
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(post);
        }

        const lines = [
          "# GPUFlow Blog",
          "",
          "> GPU rental guides, pricing comparisons, benchmarks, and tutorials for ML engineers and AI developers.",
          "",
          "## About GPUFlow",
          "",
          "GPUFlow (gpuflow.app) is a marketplace where people rent GPUs by the hour from other people. Renters add credits by card through Stripe and get an OpenAI-compatible API key for the GPU they rent, billed to the second. Providers run one command on a Linux machine with a GPU, set an hourly price, and cash out to a bank account through Stripe.",
          "",
          "- Platform: https://gpuflow.app",
          "- Documentation: https://docs.gpuflow.app",
          "- Blog: https://blog.gpuflow.app/en/",
          "- Every post is also published in es, fr, de, ja, ko, zh_cn, zh_tw, pt_br, ru, he, ar and hi at https://blog.gpuflow.app/<lang>/<slug>/",
          "",
          "## Posts",
          "",
        ];

        for (const [cat, catPosts] of Object.entries(grouped)) {
          const label = categoryLabels[cat] || cat;
          lines.push(`### ${label}`);
          for (const post of catPosts) {
            lines.push(`- ${post.title}: ${post.url}`);
            lines.push(`  ${post.description}`);
          }
          lines.push("");
        }

        lines.push("## Key Topics Covered", "");
        lines.push("- What renting a GPU really costs, including fees and extras");
        lines.push("- Hourly GPU rental compared with per-token AI APIs");
        lines.push("- GPUFlow, Vast.ai, RunPod and other GPU rental platforms compared");
        lines.push("- Using an OpenAI-compatible API key in apps and code");
        lines.push("- Earning money by renting out a GPU");
        lines.push("- LLM inference benchmarks (Ollama, vLLM, TGI, RTX 4090)");
        lines.push("- Fine-tuning (QLoRA, LoRA, Stable Diffusion) and data security on rented GPUs");
        lines.push("- Enterprise AI policies and open-weights alternatives");

        const outPath = join(dir.pathname, "llms.txt");
        await fs.writeFile(outPath, lines.join("\n"));
        console.log(
          `[generate-llms-txt] wrote ${posts.length} posts to llms.txt`,
        );
      },
    },
  };
}

// Sitemap lastmod by URL path: a post's updatedDate or pubDate, and for a
// language home page the newest of its posts. Pages without a real date get none.
async function lastmodByPath() {
  const root = join(process.cwd(), "src/content/blog");
  const dates = new Map();
  for (const dir of await fs.readdir(root, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const lang = dir.name;
    for (const file of await fs.readdir(join(root, lang))) {
      if (!/\.mdx?$/.test(file)) continue;
      const { data } = matter(await fs.readFile(join(root, lang, file), "utf-8"));
      if (data.draft) continue;
      const date = new Date(data.updatedDate ?? data.pubDate);
      dates.set(`/${lang}/${file.replace(/\.mdx?$/, "")}/`, date);
      const home = dates.get(`/${lang}/`);
      if (!home || date > home) dates.set(`/${lang}/`, date);
    }
  }
  return dates;
}

const lastmods = await lastmodByPath();

// https://astro.build/config
export default defineConfig({
  site: "https://blog.gpuflow.app",
  integrations: [
    mdx(),
    sitemap({
      serialize(item) {
        const date = lastmods.get(new URL(item.url).pathname);
        if (date) item.lastmod = date.toISOString();
        return item;
      },
    }),
    generateLlmsTxt(),
  ],

  image: {
    layout: "constrained",
    responsiveStyles: true,
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        limitInputPixels: false,
      },
    },
  },
});

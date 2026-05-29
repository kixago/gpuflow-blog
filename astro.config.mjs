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
          "> GPU rental guides, pricing comparisons, benchmarks, and tutorials for ML engineers and AI developers. Learn how to rent GPUs up to 60% cheaper than AWS using decentralized infrastructure and crypto payments.",
          "",
          "## About GPUFlow",
          "",
          "GPUFlow is a decentralized GPU rental marketplace connecting GPU owners with AI/ML developers, miners, and researchers. Payments via stablecoin (USDC/USDT) on Polygon. No KYC required. Smart contract escrow protects all payments.",
          "",
          "- Platform: https://gpuflow.app",
          "- Documentation: https://docs.gpuflow.app",
          "- Blog: https://blog.gpuflow.app/en/",
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
        lines.push(
          "- GPU rental pricing and cost comparison (AWS vs decentralized)",
        );
        lines.push("- LLM inference benchmarks (Ollama, vLLM, TGI, RTX 4090)");
        lines.push("- Private AI training and data security on rented GPUs");
        lines.push("- Crypto payments for GPU rental (USDC, USDT, Polygon)");
        lines.push("- No-KYC GPU rental options");
        lines.push("- Fine-tuning (QLoRA, LoRA, Stable Diffusion)");
        lines.push("- Smart contract escrow for trustless payments");
        lines.push("- Enterprise AI compliance and ChatGPT alternatives");

        const outPath = join(dir.pathname, "llms.txt");
        await fs.writeFile(outPath, lines.join("\n"));
        console.log(
          `[generate-llms-txt] wrote ${posts.length} posts to llms.txt`,
        );
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://blog.gpuflow.app",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/debug/"),
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

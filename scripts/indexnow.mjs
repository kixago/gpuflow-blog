// Tell IndexNow (Bing and other engines) which blog URLs were added, changed or removed.
// Run after pushing:
//   pnpm indexnow            posts changed in the last commit
//   pnpm indexnow --all      every URL in dist/sitemap-*.xml (run pnpm build first)
//   pnpm indexnow URL...     these URLs
// --dry-run prints the URLs without sending them.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";

const host = "blog.gpuflow.app";
const site = `https://${host}`;
const key = "d0d48b7d37b4401d911756d7ebade672";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const explicit = args.filter((a) => !a.startsWith("--"));

function lastCommitUrls() {
  const diff = execFileSync(
    "git",
    ["diff", "--name-status", "HEAD~1", "HEAD", "--", "src/content/blog"],
    { encoding: "utf8" },
  );
  const urls = new Set();
  for (const line of diff.split("\n")) {
    // A rename lists the old and the new path; both addresses changed.
    for (const path of line.split("\t").slice(1)) {
      const m = path.match(/^src\/content\/blog\/([^/]+)\/([^/]+)\.mdx?$/);
      if (!m) continue;
      const [, lang, slug] = m;
      urls.add(`${site}/${lang}/${slug}/`);
      urls.add(`${site}/${lang}/`);
      urls.add(`${site}/${lang}/rss.xml`);
      // The English feed is also served at /rss.xml.
      if (lang === "en") urls.add(`${site}/rss.xml`);
    }
  }
  return [...urls];
}

function sitemapUrls() {
  const files = existsSync("dist") ? readdirSync("dist").filter((f) => /^sitemap-\d+\.xml$/.test(f)) : [];
  if (!files.length) {
    console.error("no dist/sitemap-*.xml, run pnpm build first");
    process.exit(1);
  }
  return files.flatMap((f) =>
    [...readFileSync(`dist/${f}`, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]),
  );
}

const urls = explicit.length ? explicit : args.includes("--all") ? sitemapUrls() : lastCommitUrls();

const foreign = urls.filter((u) => !u.startsWith(`${site}/`));
if (foreign.length) {
  console.error(`not on ${site}: ${foreign.join(" ")}`);
  process.exit(1);
}
if (!urls.length) {
  console.log("nothing to submit");
  process.exit(0);
}
console.log(urls.join("\n"));
if (dryRun) process.exit(0);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host, key, keyLocation: `${site}/${key}.txt`, urlList: urls }),
});

// Meanings from https://www.indexnow.org/documentation
const meaning = {
  200: "OK, URLs submitted",
  202: "Accepted, key validation pending",
  400: "Bad request, invalid format",
  403: "Forbidden, key not valid or key file not found",
  422: "Unprocessable, URLs do not belong to the host or the key does not match",
  429: "Too many requests, possible spam",
};
console.log(`${urls.length} URLs: ${res.status} ${meaning[res.status] ?? res.statusText}`);
if (res.status !== 200 && res.status !== 202) process.exit(1);

// Bài viết tĩnh (Markdown + frontmatter) trong content/<mục>/, đọc lúc build trên server.
import fs from "node:fs";
import path from "node:path";

export interface Article {
  slug: string;
  title: string;
  description: string;
  number: number;
  keyword: string;
  body: string;
}

const ROOT = path.join(process.cwd(), "content");

function parse(slug: string, raw: string): Article {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  (m?.[1] ?? "").split("\n").forEach((line) => {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  });
  return { slug, title: meta.title ?? slug, description: meta.description ?? "", number: Number(meta.number) || 0, keyword: meta.keyword ?? "", body: (m?.[2] ?? raw).trim() };
}

export function listArticles(section: string): Article[] {
  const dir = path.join(ROOT, section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parse(f.replace(/\.md$/, ""), fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => a.number - b.number);
}

export function getArticle(section: string, slug: string): Article | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const file = path.join(ROOT, section, `${slug}.md`);
  return fs.existsSync(file) ? parse(slug, fs.readFileSync(file, "utf8")) : null;
}

/** Các câu hỏi ### trong mục "Câu hỏi thường gặp" → dữ liệu FAQ cho Google. */
export function faqOf(body: string): { q: string; a: string }[] {
  const sec = body.split(/^## /m).find((s) => s.startsWith("Câu hỏi thường gặp"));
  if (!sec) return [];
  return sec
    .split(/^### /m)
    .slice(1)
    .map((b) => {
      const [q, ...rest] = b.split("\n");
      // chỉ lấy đoạn văn đầu tiên sau câu hỏi (tránh dính đoạn miễn trừ cuối bài)
      const first = rest.join("\n").trim().split(/\n\s*\n/)[0] ?? "";
      return { q: q.trim(), a: first.replace(/\*\*/g, "").replace(/\s+/g, " ").trim() };
    })
    .filter((x) => x.q && x.a);
}

export const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

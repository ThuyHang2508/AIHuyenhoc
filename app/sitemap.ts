import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/articles";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [["", 1], ["/than-so-hoc", 0.9], ["/tu-vi", 0.9], ["/tarot", 0.9], ["/bai-tay", 0.8], ["/chiem-tinh", 0.9], ["/board-game", 0.8], ["/ma-soi", 0.8], ["/thuy", 0.8], ["/hoi-dap", 0.6], ["/dieu-khoan", 0.2]];
  listArticles("than-so-hoc").forEach((a) => pages.push([`/than-so-hoc/${a.slug}`, 0.7]));
  return pages.map(([path, priority]) => ({ url: `${SITE}${path}`, lastModified: new Date(), changeFrequency: "weekly", priority }));
}

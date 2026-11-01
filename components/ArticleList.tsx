import Link from "next/link";
import { listArticles } from "@/lib/articles";

/** Danh sách bài viết ý nghĩa các con số (server component, đặt cuối trang công cụ). */
export default function ArticleList({ section, title }: { section: string; title: string }) {
  const list = listArticles(section);
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-[1400px] px-5 pb-4 md:px-6">
      <h2 className="mb-4 font-serif text-headline-sm text-primary">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((a) => (
          <Link key={a.slug} href={`/${section}/${a.slug}`} className="panel glass-hover group block !p-4">
            <div className="label-sm text-secondary">{a.keyword}</div>
            <div className="mt-1 font-serif text-[19px] leading-6 text-primary group-hover:text-primary-container">{a.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

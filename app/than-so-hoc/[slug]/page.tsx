import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Icon from "@/components/Icon";
import Markdown from "@/components/Markdown";
import { faqOf, getArticle, listArticles, slugify } from "@/lib/articles";

const SECTION = "than-so-hoc";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamicParams = false;
export function generateStaticParams() {
  return listArticles(SECTION).map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = getArticle(SECTION, params.slug);
  if (!a) return {};
  const url = `${SITE}/${SECTION}/${a.slug}`;
  return { title: a.title, description: a.description, alternates: { canonical: url }, openGraph: { title: a.title, description: a.description, url, type: "article", locale: "vi_VN" } };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = getArticle(SECTION, params.slug);
  if (!a) notFound();
  const all = listArticles(SECTION);
  const others = all.filter((x) => x.slug !== a.slug && x.slug.startsWith("so-chu-dao"));
  const toc = [...a.body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  const faq = faqOf(a.body);
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.description, inLanguage: "vi", mainEntityOfPage: `${SITE}/${SECTION}/${a.slug}`, publisher: { "@type": "Organization", name: "AetherAI" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE },
      { "@type": "ListItem", position: 2, name: "Thần Số Học", item: `${SITE}/${SECTION}` },
      { "@type": "ListItem", position: 3, name: a.title, item: `${SITE}/${SECTION}/${a.slug}` },
    ] },
    ...(faq.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-8 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary-container">Trang chủ</Link><span>/</span>
        <Link href={`/${SECTION}`} className="hover:text-primary-container">Thần Số Học</Link><span>/</span>
        <span className="text-on-surface-variant">{a.number ? `Số chủ đạo ${a.number}` : a.keyword}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <header className="mb-8">
            {a.keyword && <span className="chip mb-3">{a.keyword}</span>}
            <h1 className="font-serif text-[38px] leading-[44px] text-primary md:text-[46px] md:leading-[52px]">{a.title}</h1>
            <p className="mt-3 text-lg text-on-surface-variant">{a.description}</p>
          </header>
          <Markdown text={a.body} article />
          <div className="mt-10 rounded-2xl border border-emerald/30 bg-emerald/[0.06] p-6">
            <h2 className="font-serif text-[26px] text-primary">Tính số chủ đạo của bạn</h2>
            <p className="mt-1 text-on-surface-variant">Nhập ngày sinh và họ tên để xem đủ bản đồ thần số học, kèm AI luận giải riêng cho bạn.</p>
            <Link href={`/${SECTION}`} className="btn-neon mt-4 inline-flex"><Icon name="auto_fix_high" className="text-[18px]" /> Xem bản đồ thần số học</Link>
          </div>
        </article>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {toc.length > 0 && (
            <nav className="panel" aria-label="Mục lục">
              <div className="label-sm mb-3 text-secondary">Mục lục</div>
              <ol className="space-y-1.5 text-sm">
                {toc.map((t) => <li key={t}><a href={`#${slugify(t)}`} className="text-on-surface-variant hover:text-primary-container">{t}</a></li>)}
              </ol>
            </nav>
          )}
          <nav className="panel" aria-label="Các số chủ đạo khác">
            <div className="label-sm mb-3 text-secondary">Các số chủ đạo khác</div>
            <div className="flex flex-wrap gap-2">
              {others.map((o) => (
                <Link key={o.slug} href={`/${SECTION}/${o.slug}`} className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-white/[0.08] px-2 font-serif text-[18px] text-primary hover:border-primary-container">
                  {o.number === 22 ? "22/4" : o.number === 33 ? "33/6" : o.number}
                </Link>
              ))}
            </div>
            {all.some((x) => x.slug === "cach-tinh-so-chu-dao") && a.slug !== "cach-tinh-so-chu-dao" && (
              <Link href={`/${SECTION}/cach-tinh-so-chu-dao`} className="mt-4 block text-sm text-primary-container hover:underline">Cách tính số chủ đạo →</Link>
            )}
          </nav>
        </aside>
      </div>
    </div>
  );
}

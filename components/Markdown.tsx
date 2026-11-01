// Bộ hiển thị Markdown tối giản, an toàn (escape HTML trước khi định dạng).
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s: string) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>")
    .replace(/(^|\s)_([^_]+?)_(?=\s|[.,;:!?]|$)/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, "<code class=\"rounded bg-surface-container-high px-1 text-emerald-mist\">$1</code>");

const slugId = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** article = true: "##" → h2, "###" → h3 có id (trang bài viết); mặc định mọi tiêu đề là h4 (khung chat). */
export function mdToHtml(md: string, article = false): string {
  const out: string[] = [];
  let list: string[] = [];
  let table: string[][] = [];
  const flushTable = () => {
    if (!table.length) return;
    const [head, ...body] = table;
    const cells = (r: string[], tag: string) => r.map((c) => `<${tag}>${inline(c)}</${tag}>`).join("");
    out.push(
      `<div class="md-table"><table><thead><tr>${cells(head, "th")}</tr></thead><tbody>${body.map((r) => `<tr>${cells(r, "td")}</tr>`).join("")}</tbody></table></div>`,
    );
    table = [];
  };
  const flush = () => {
    if (list.length) out.push(`<ul>${list.map((l) => `<li>${inline(l)}</li>`).join("")}</ul>`);
    list = [];
    flushTable();
  };
  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    if (/^\s*\|.*\|\s*$/.test(line)) {
      if (list.length) { out.push(`<ul>${list.map((l) => `<li>${inline(l)}</li>`).join("")}</ul>`); list = []; }
      const row = line.trim().slice(1, -1).split("|").map((c) => c.trim());
      if (!row.every((c) => /^:?-{2,}:?$/.test(c))) table.push(row);
      continue;
    }
    flushTable();
    const li = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
    if (li) { list.push(li[1]); continue; }
    flush();
    if (!line.trim()) continue;
    const img = line.trim().match(/^!\[([^\]]*)\]\((\/img\/tarot\/[a-z]+-\d+\.jpg)(\?r=1)?\)$/);
    if (img) {
      out.push(`<img class="md-card${img[3] ? " md-card-rev" : ""}" src="${img[2]}" alt="${esc(img[1]).replace(/"/g, "&quot;")}" loading="lazy" />`);
      continue;
    }
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h && article) {
      const lv = Math.min(Math.max(line.indexOf(" "), 2), 4);
      out.push(`<h${lv} id="${slugId(h[1])}">${inline(h[1])}</h${lv}>`);
    } else if (h) out.push(`<h4>${inline(h[1])}</h4>`);
    else out.push(`<p>${inline(line)}</p>`);
  }
  flush();
  return out.join("");
}

export default function Markdown({ text, className = "", article = false }: { text: string; className?: string; article?: boolean }) {
  return <div className={`${article ? "prose-article" : "prose-oracle"} text-[15px] ${className}`} dangerouslySetInnerHTML={{ __html: mdToHtml(text, article) }} />;
}

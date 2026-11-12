/**
 * HTML + Markdown templates for the findings report (texts in Indonesian for the team).
 * Only presentation lives here; grouping/merging is in reporter.ts.
 */
import type { Finding } from './findings';
import type { Severity } from './issues';

export const SEVERITY_ORDER: Severity[] = ['Critical', 'High', 'Medium', 'Low', 'Info'];

export interface IssueGroup {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  sites: Set<string>;
  items: Finding[];
}

export interface ReportMeta {
  generatedAt: string;
  startedAt: string;
  status: string;
  durationMin: number;
  tests: { total: number; passed: number; failed: number; skipped: number };
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function countBy(groups: IssueGroup[]) {
  const c: Record<string, number> = {};
  SEVERITY_ORDER.forEach((s) => (c[s] = groups.filter((g) => g.severity === s).length));
  return c;
}

export function renderMarkdown(groups: IssueGroup[], meta: ReportMeta) {
  const c = countBy(groups);
  const lines = [
    `# Laporan Temuan QA — Akasha Yoga Academy`,
    ``,
    `- **Tanggal run:** ${meta.generatedAt.slice(0, 16).replace('T', ' ')} UTC`,
    `- **Cakupan:** course.akashayogaacademy.com & www.akashayogaacademy.com (semua halaman sitemap, flow checkout, navigasi)`,
    `- **Test:** ${meta.tests.total} total · ${meta.tests.passed} lulus · ${meta.tests.failed} gagal · ${meta.tests.skipped} skip`,
    `- **Temuan:** ${SEVERITY_ORDER.map((s) => `${s}: ${c[s]}`).join(' · ')}`,
    ``,
    `| ID | Severity | Kategori | Temuan | Halaman terdampak |`,
    `|---|---|---|---|---|`,
    ...groups.map((g) => `| ${g.id} | ${g.severity} | ${g.category} | ${g.title.replace(/\|/g, '\\|')} | ${new Set(g.items.map((i) => i.pageUrl)).size} |`),
    ``,
  ];
  for (const g of groups.filter((g) => g.severity !== 'Info')) {
    const f = g.items[0];
    const pages = [...new Map(g.items.map((i) => [i.pageUrl + (i.element ?? ''), i])).values()];
    lines.push(
      `## ${g.id} · [${g.severity}] ${g.title}`, ``,
      `- **Kategori:** ${g.category}`,
      `- **Situs:** ${[...g.sites].join(', ')}`,
      `- **Expected:** ${f.expected}`,
      `- **Actual:** ${f.actual}`,
      f.recommendation ? `- **Rekomendasi:** ${f.recommendation}` : '',
      f.steps?.length ? `\n**Langkah reproduksi:**\n${f.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : '',
      f.screenshot ? `\n![screenshot](${f.screenshot})` : '',
      `\n**Terjadi di (${pages.length}):**`,
      ...pages.slice(0, 25).map((p) => `- ${p.pageUrl}${p.element ? ` — \`${p.element.replace(/`/g, "'")}\`` : ''}`),
      pages.length > 25 ? `- …dan ${pages.length - 25} lainnya (lihat findings.json)` : '',
      ``,
    );
  }
  return lines.filter((l) => l !== '').join('\n').replace(/\n## /g, '\n\n## ') + '\n';
}

export function renderHtml(groups: IssueGroup[], meta: ReportMeta) {
  const c = countBy(groups);
  const occurrences = groups.reduce((n, g) => n + g.items.length, 0);
  const rows = groups.map((g) => {
    const f = g.items[0];
    const pages = [...new Map(g.items.map((i) => [i.pageUrl + (i.element ?? ''), i])).values()];
    return `
<details class="issue" data-sev="${g.severity}" data-site="${[...g.sites].join(' ')}">
  <summary>
    <span class="id">${g.id}</span>
    <span class="sev sev-${g.severity}">${g.severity}</span>
    <span class="cat">${esc(g.category)}</span>
    <span class="title">${esc(g.title)}</span>
    <span class="count" title="Halaman terdampak">${new Set(g.items.map((i) => i.pageUrl)).size} hlm</span>
  </summary>
  <div class="body">
    <dl>
      <dt>Situs</dt><dd>${esc([...g.sites].join(', '))}</dd>
      <dt>Expected</dt><dd>${esc(f.expected)}</dd>
      <dt>Actual</dt><dd>${esc(f.actual)}</dd>
      ${f.recommendation ? `<dt>Rekomendasi</dt><dd>${esc(f.recommendation)}</dd>` : ''}
      ${f.steps?.length ? `<dt>Langkah</dt><dd><ol>${f.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></dd>` : ''}
      <dt>Test</dt><dd><code>${esc(f.testTitle)}</code></dd>
    </dl>
    ${f.screenshot ? `<a href="${esc(f.screenshot)}" target="_blank"><img class="shot" src="${esc(f.screenshot)}" alt="Screenshot ${g.id}" loading="lazy"></a>` : ''}
    <h4>Terjadi di ${pages.length} tempat</h4>
    <table><thead><tr><th>Halaman</th><th>Elemen</th><th>Actual</th></tr></thead><tbody>
    ${pages.slice(0, 200).map((p) => `<tr><td><a href="${esc(p.pageUrl)}" target="_blank">${esc(p.pageUrl.replace(/^https?:\/\//, ''))}</a></td><td>${esc(p.element ?? '—')}</td><td>${esc(p.actual)}</td></tr>`).join('')}
    </tbody></table>
  </div>
</details>`;
  }).join('\n');

  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>QA Findings Akasha</title>
<style>
:root{--bg:#f7f6f3;--card:#fff;--fg:#1d1d1f;--muted:#6b6b70;--line:#e4e2dc;--crit:#b42318;--high:#d9480f;--med:#b08800;--low:#2f6fb3;--info:#6b7280;--accent:#5fbfa6}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#141416;--card:#1d1d20;--fg:#ececee;--muted:#9a9aa2;--line:#2e2e33;--crit:#f97066;--high:#fb8c4b;--med:#e3c04f;--low:#6aa8ef;--info:#9ca3af}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 64px}
h1{font-size:22px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 20px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:18px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}.card b{display:block;font-size:24px}.card span{color:var(--muted);font-size:12px}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.filters button{border:1px solid var(--line);background:var(--card);color:var(--fg);padding:6px 12px;border-radius:999px;cursor:pointer}
.filters button.on{background:var(--fg);color:var(--bg)}
.issue{background:var(--card);border:1px solid var(--line);border-radius:10px;margin-bottom:8px}
.issue summary{display:flex;gap:10px;align-items:center;padding:10px 14px;cursor:pointer;flex-wrap:wrap}
.id{font-family:ui-monospace,monospace;color:var(--muted);font-size:12px}.cat{color:var(--muted);font-size:12px}
.title{flex:1;min-width:200px;font-weight:600}.count{font-size:12px;color:var(--muted)}
.sev{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;color:#fff;text-transform:uppercase;letter-spacing:.04em}
.sev-Critical{background:var(--crit)}.sev-High{background:var(--high)}.sev-Medium{background:var(--med)}.sev-Low{background:var(--low)}.sev-Info{background:var(--info)}
.body{padding:0 14px 14px;border-top:1px solid var(--line)}dl{display:grid;grid-template-columns:110px 1fr;gap:6px 12px}dt{color:var(--muted)}dd{margin:0;word-break:break-word}
.shot{max-width:100%;border:1px solid var(--line);border-radius:8px;margin:8px 0}
table{width:100%;border-collapse:collapse;font-size:12px;display:block;overflow-x:auto}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}td{word-break:break-all}
a{color:var(--low)}code{font-size:12px}
</style></head><body><main>
<h1>Laporan Temuan QA — Akasha Yoga Academy</h1>
<p class="sub">course.akashayogaacademy.com &amp; www.akashayogaacademy.com · run ${esc(meta.generatedAt.slice(0, 16).replace('T', ' '))} UTC · ${meta.durationMin} menit</p>
<div class="cards">
  <div class="card"><b>${meta.tests.total}</b><span>Test dijalankan</span></div>
  <div class="card"><b>${meta.tests.passed}</b><span>Lulus</span></div>
  <div class="card"><b>${meta.tests.failed}</b><span>Gagal</span></div>
  ${SEVERITY_ORDER.map((s) => `<div class="card"><b style="color:var(--${{ Critical: 'crit', High: 'high', Medium: 'med', Low: 'low', Info: 'info' }[s]})">${c[s]}</b><span>${s}</span></div>`).join('')}
</div>
<p class="sub">${groups.length} temuan unik dari ${occurrences} kejadian. Klik baris untuk detail, langkah reproduksi dan screenshot.</p>
<div class="filters" id="f">
  <button class="on" data-f="all">Semua</button>${SEVERITY_ORDER.map((s) => `<button data-f="${s}">${s} (${c[s]})</button>`).join('')}
  <button data-f="course">course.*</button><button data-f="main">www.*</button>
</div>
${rows || '<p>🎉 Tidak ada temuan.</p>'}
</main>
<script>
document.getElementById('f').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
document.querySelectorAll('#f button').forEach(x=>x.classList.toggle('on',x===b));const f=b.dataset.f;
document.querySelectorAll('.issue').forEach(i=>{i.style.display=(f==='all'||i.dataset.sev===f||i.dataset.site.split(' ').includes(f))?'':'none'})});
</script></body></html>`;
}

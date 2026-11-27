// DealHawk rendering: turns deals into the cards, the stats bar, the top
// picks strip and the detail view. No network, no images — each category
// gets a small inline SVG mark drawn here.
import { META } from "./data.js";
import { discountPct, dollarsSaved, dealScore, formatMoney, formatPct, VERDICT_LABELS } from "./scoring.js";

// One inline SVG mark per category, drawn as simple strokes so the site
// needs no image files at all.
export const CATEGORY_ICONS = {
  "TVs & Home Theater":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  "Laptops & Monitors":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/></svg>',
  "Headphones & Audio":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="13" width="4" height="7" rx="1.5"/><rect x="18" y="13" width="4" height="7" rx="1.5"/></svg>',
  "Smart Home":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
  Gaming:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10a5 5 0 0 1 5 5v1a3 3 0 0 1-5.4 1.8L15 14H9l-1.6 1.8A3 3 0 0 1 2 14v-1a5 5 0 0 1 5-5Z"/><path d="M7 11v3M5.5 12.5h3M16 11h.01M18 13h.01"/></svg>',
  "Phones, Tablets & Accessories":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18.5h2"/></svg>',
  Wearables:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 1.5M9 2h6M9 22h6"/></svg>',
  Beauty:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c2 3 5 4.5 5 8a5 5 0 0 1-10 0c0-3.5 3-5 5-8Z"/></svg>',
  "Kitchen & Home":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v2a8 8 0 0 1-16 0v-2Z"/><path d="M8 10V4M12 10V3M16 10V4"/></svg>',
  "Cameras & Drones":
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-2h6l2 2h3v11H4V8Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
};

function iconFor(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS["Kitchen & Home"];
}

// Escape the few deal fields that reach the DOM as text.
export function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// One deal card: product, store, prices, verdict and the evidence line.
export function dealCard(deal, cheapestNote) {
  const pct = discountPct(deal);
  const saved = dollarsSaved(deal);
  const score = dealScore(deal);
  return `<article class="card" data-id="${esc(deal.id)}">
    <div class="card-top">
      <span class="card-icon">${iconFor(deal.category)}</span>
      <span class="store-badge store-${deal.store.toLowerCase().replace(/ /g, "-")}">${esc(deal.store)}</span>
      <span class="pct-badge">${formatPct(pct)}</span>
    </div>
    <h3 class="card-name">${esc(deal.name)}</h3>
    <p class="card-cat">${esc(deal.category)}</p>
    <div class="card-prices">
      <span class="sale">${formatMoney(deal.sale)}</span>
      <span class="usual">${formatMoney(deal.usual)}</span>
      <span class="saved">save ${formatMoney(saved)}</span>
    </div>
    <p class="verdict verdict-${deal.verdict}">
      <span class="verdict-dot"></span>${esc(VERDICT_LABELS[deal.verdict])}
      <span class="verdict-score" title="DealHawk score out of 100">${score}/100</span>
    </p>
    <p class="evidence">${esc(deal.evidence)}</p>
    ${cheapestNote ? `<p class="compare-note">${cheapestNote}</p>` : ""}
    <p class="checked">Checked ${esc(META.checkedLabel)} · ${esc(deal.source)}</p>
    <div class="card-actions">
      <a class="btn-store" href="${esc(deal.url)}" target="_blank" rel="noopener">View at ${esc(deal.store)} ↗</a>
      <a class="btn-detail" href="#/deal/${esc(deal.id)}">Details</a>
    </div>
  </article>`;
}

// The "same product, cheaper elsewhere" line under a card.
export function compareNoteFor(deal, groups) {
  for (const group of groups) {
    if (!group.some((item) => item.id === deal.id)) continue;
    const cheapest = [...group].sort((a, b) => a.sale - b.sale)[0];
    if (cheapest.id === deal.id) {
      const others = group.filter((item) => item.id !== deal.id);
      const dearest = [...others].sort((a, b) => b.sale - a.sale)[0];
      return `Cheapest anywhere — ${esc(dearest.store)} charges ${formatMoney(dearest.sale)} for the same item.`;
    }
    return `Same product at ${esc(cheapest.store)} for ${formatMoney(cheapest.sale)} — ${formatMoney(deal.sale - cheapest.sale)} less.`;
  }
  return "";
}

// The stats strip: how many deals, the average cut, the total saving.
export function statsBar(stats) {
  return `<div class="stat"><strong>${stats.count}</strong><span>deals checked</span></div>
  <div class="stat"><strong>${stats.avgPct}%</strong><span>average discount</span></div>
  <div class="stat"><strong>$${stats.totalSaved.toLocaleString("en-US")}</strong><span>total savings</span></div>
  <div class="stat"><strong>${stats.stores}</strong><span>stores</span></div>
  <div class="stat"><strong>${stats.newLows}</strong><span>new lows</span></div>`;
}

// The top-picks strip: the five best-scoring deals, as a compact list.
export function topPicks(deals) {
  const top = [...deals].sort((a, b) => dealScore(b) - dealScore(a)).slice(0, 5);
  return top
    .map(
      (deal, index) =>
        `<a class="pick" href="#/deal/${esc(deal.id)}"><span class="pick-rank">${index + 1}</span><span class="pick-name">${esc(deal.name)}</span><span class="pick-price">${formatMoney(deal.sale)}</span><span class="pick-pct">${formatPct(discountPct(deal))}</span></a>`,
    )
    .join("");
}

// The detail view for one deal: every field, the verdict explained, and
// the same product at other stores when it exists.
export function dealDetail(deal, group) {
  const pct = discountPct(deal);
  const saved = dollarsSaved(deal);
  const score = dealScore(deal);
  const others = group ? group.filter((item) => item.id !== deal.id) : [];
  const compareRows = others
    .map(
      (item) =>
        `<tr><td>${esc(item.store)}</td><td>${formatMoney(item.sale)}</td><td>${formatMoney(item.usual)}</td><td>${formatPct(discountPct(item))}</td><td><a href="${esc(item.url)}" target="_blank" rel="noopener">View ↗</a></td></tr>`,
    )
    .join("");
  return `<section class="detail">
    <p class="detail-back"><a href="#/">← All deals</a></p>
    <div class="detail-head">
      <span class="card-icon big">${iconFor(deal.category)}</span>
      <div>
        <h2>${esc(deal.name)}</h2>
        <p class="card-cat">${esc(deal.category)} · ${esc(deal.store)}</p>
      </div>
      <span class="pct-badge big">${formatPct(pct)}</span>
    </div>
    <div class="detail-prices">
      <div><span class="lbl">Sale price</span><strong class="sale big">${formatMoney(deal.sale)}</strong></div>
      <div><span class="lbl">Usual price</span><strong class="usual big">${formatMoney(deal.usual)}</strong></div>
      <div><span class="lbl">You save</span><strong>${formatMoney(saved)}</strong></div>
      <div><span class="lbl">DealHawk score</span><strong>${score}/100</strong></div>
    </div>
    <p class="verdict verdict-${deal.verdict} big"><span class="verdict-dot"></span>${esc(VERDICT_LABELS[deal.verdict])}</p>
    <p class="evidence big">${esc(deal.evidence)}</p>
    ${others.length ? `<h3>Same product, other stores</h3>
    <table class="compare"><thead><tr><th>Store</th><th>Sale</th><th>Usual</th><th>Off</th><th></th></tr></thead><tbody>${compareRows}</tbody></table>` : ""}
    <p class="checked">Price checked ${esc(META.checkedLabel)} · Source: ${esc(deal.source)}</p>
    <p class="detail-actions"><a class="btn-store" href="${esc(deal.url)}" target="_blank" rel="noopener">View at ${esc(deal.store)} ↗</a></p>
  </section>`;
}

// Empty state when a filter combination matches nothing.
export function emptyState() {
  return `<div class="empty"><h2>No deals match that</h2><p>Loosen the filters or clear the search — every deal is still listed under “All”.</p><p><a href="#/" class="btn-store">Show all deals</a></p></div>`;
}

// DealHawk scoring: every number on a card is computed here from the two
// prices in data.js, so the discount a card shows always matches them.
import { DEALS } from "./data.js";

// Discount as a whole percent, rounded down so a card never overstates it.
export function discountPct(deal) {
  if (deal.usual <= 0 || deal.sale >= deal.usual) return 0;
  return Math.floor(((deal.usual - deal.sale) / deal.usual) * 100);
}

// Dollars saved, to the cent the two prices imply.
export function dollarsSaved(deal) {
  return Math.round((deal.usual - deal.sale) * 100) / 100;
}

// Deal score, 0-100: how good the deal is for a shopper. The discount
// carries most of it, the dollar saving the rest, and a new low or a
// strong verdict adds a bonus the routine ones never get.
export function dealScore(deal) {
  const pct = discountPct(deal);
  const saved = dollarsSaved(deal);
  const pctPart = Math.min(pct, 70) * 0.9;
  const savedPart = Math.min(saved, 400) * 0.06;
  const verdictBonus =
    deal.verdict === "new-low" ? 12 : deal.verdict === "strong" ? 7 : deal.verdict === "good" ? 3 : 0;
  return Math.min(100, Math.round(pctPart + savedPart + verdictBonus));
}

export const VERDICT_LABELS = {
  "new-low": "New low",
  strong: "Strong deal",
  good: "Good deal",
  routine: "Routine sale",
};

// One line the verdict badge shows next to the label.
export const VERDICT_HINTS = {
  "new-low": "Lowest price seen for this model",
  strong: "A deep cut — worth acting on",
  good: "A solid saving",
  routine: "Thin cut — buy for the price, not the discount",
};

// Group listings of the same product across stores (same name ignoring a
// trailing color or store-only suffix) so a card can show the cheapest
// store and what the others charge for the identical item.
export function sameProductGroups(deals) {
  const groups = new Map();
  for (const deal of deals) {
    const key = deal.name
      .toLowerCase()
      .replace(/, matte white.*$/, "")
      .replace(/ \(newest model\)$/, "")
      .replace(/ \(2026\)$/, "")
      .trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(deal);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}

// The cheapest listing of a product, and how much the others cost above it.
export function cheapestOf(group) {
  return [...group].sort((a, b) => a.sale - b.sale)[0];
}

// Money as a shopper reads it: $1,049 or $229.99, no trailing .00 noise.
export function formatMoney(value) {
  const rounded = Math.round(value * 100) / 100;
  return "$" + rounded.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Whole-number percent with its sign, for the discount badge.
export function formatPct(pct) {
  return "-" + pct + "%";
}

// Sort comparators the sort control offers, best deals first by default.
export const SORTS = {
  best: {
    label: "Best deal first",
    compare: (a, b) => dealScore(b) - dealScore(a) || dollarsSaved(b) - dollarsSaved(a),
  },
  pct: {
    label: "Biggest % off",
    compare: (a, b) => discountPct(b) - discountPct(a) || dollarsSaved(b) - dollarsSaved(a),
  },
  saved: {
    label: "Biggest $ saving",
    compare: (a, b) => dollarsSaved(b) - dollarsSaved(a) || discountPct(b) - discountPct(a),
  },
  low: {
    label: "Price: low to high",
    compare: (a, b) => a.sale - b.sale,
  },
  high: {
    label: "Price: high to low",
    compare: (a, b) => b.sale - a.sale,
  },
};

// Summary numbers for the stats bar above the grid.
export function statsFor(deals) {
  if (deals.length === 0) {
    return { count: 0, avgPct: 0, totalSaved: 0, stores: 0, newLows: 0 };
  }
  const totalPct = deals.reduce((sum, deal) => sum + discountPct(deal), 0);
  const totalSaved = deals.reduce((sum, deal) => sum + dollarsSaved(deal), 0);
  const stores = new Set(deals.map((deal) => deal.store)).size;
  const newLows = deals.filter((deal) => deal.verdict === "new-low").length;
  return {
    count: deals.length,
    avgPct: Math.round(totalPct / deals.length),
    totalSaved: Math.round(totalSaved),
    stores,
    newLows,
  };
}

// Keep DEALS imported for the module graph the dossier shows; the helpers
// above are what the rest of the site calls.
export const DEAL_COUNT = DEALS.length;

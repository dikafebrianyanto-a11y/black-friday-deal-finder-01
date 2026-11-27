// DealHawk app: search, filters, sorting and the detail route. All state
// lives in this module; the deal list itself is never fetched — it ships
// in data.js, so the site works with no network at all.
import { DEALS, META, CATEGORIES } from "./data.js";
import { discountPct, dealScore, statsFor, SORTS, sameProductGroups } from "./scoring.js";
import { dealCard, compareNoteFor, statsBar, topPicks, dealDetail, emptyState } from "./render.js";

const state = {
  query: "",
  category: "All",
  store: "All",
  minPct: 0,
  verdict: "All",
  sort: "best",
};

// Which deals survive the current filters, in the current sort order.
export function visibleDeals() {
  const query = state.query.trim().toLowerCase();
  const kept = DEALS.filter((deal) => {
    if (state.category !== "All" && deal.category !== state.category) return false;
    if (state.store !== "All" && deal.store !== state.store) return false;
    if (state.verdict !== "All" && deal.verdict !== state.verdict) return false;
    if (discountPct(deal) < state.minPct) return false;
    if (query) {
      const haystack = (deal.name + " " + deal.store + " " + deal.category).toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
  return kept.sort(SORTS[state.sort].compare);
}

function fillSelect(select, options, current) {
  select.innerHTML = options
    .map((option) => `<option value="${option}"${option === current ? " selected" : ""}>${option}</option>`)
    .join("");
}

function buildControls() {
  const categorySelect = document.getElementById("filter-category");
  const storeSelect = document.getElementById("filter-store");
  const pctSelect = document.getElementById("filter-discount");
  const verdictSelect = document.getElementById("filter-verdict");
  const sortSelect = document.getElementById("sort");
  fillSelect(categorySelect, ["All", ...CATEGORIES], state.category);
  fillSelect(storeSelect, ["All", ...META.stores], state.store);
  fillSelect(pctSelect, ["0", "20", "30", "40", "50"], String(state.minPct));
  fillSelect(verdictSelect, ["All", "new-low", "strong", "good", "routine"], state.verdict);
  sortSelect.innerHTML = Object.entries(SORTS)
    .map(([key, sort]) => `<option value="${key}"${key === state.sort ? " selected" : ""}>${sort.label}</option>`)
    .join("");
}

function renderList() {
  const grid = document.getElementById("deal-grid");
  const count = document.getElementById("result-count");
  const groups = sameProductGroups(DEALS);
  const visible = visibleDeals();
  count.textContent = visible.length + (visible.length === 1 ? " deal" : " deals");
  document.getElementById("stats").innerHTML = statsBar(statsFor(visible));
  grid.innerHTML = visible.length
    ? visible.map((deal) => dealCard(deal, compareNoteFor(deal, groups))).join("")
    : emptyState();
}

function renderDetail(id) {
  const main = document.getElementById("main");
  const deal = DEALS.find((item) => item.id === id);
  const groups = sameProductGroups(DEALS);
  const group = groups.find((items) => items.some((item) => item.id === id));
  main.innerHTML = deal ? dealDetail(deal, group) : emptyState();
  window.scrollTo(0, 0);
}

function renderRoute() {
  const hash = window.location.hash || "#/";
  const match = hash.match(/^#\/deal\/([a-z0-9-]+)$/);
  const main = document.getElementById("main");
  if (match) {
    renderDetail(match[1]);
    return;
  }
  if (!document.getElementById("deal-grid")) {
    main.innerHTML = `<section class="picks"><h2>Top picks</h2><div class="pick-list">${topPicks(DEALS)}</div></section>
    <section class="controls" id="controls"></section>
    <p class="result-line"><span id="result-count"></span> <span id="sort-note">sorted by ${SORTS[state.sort].label.toLowerCase()}</span></p>
    <div class="grid" id="deal-grid"></div>`;
    document.getElementById("controls").appendChild(buildControlsNode());
    wireControls();
  }
  renderList();
}

function buildControlsNode() {
  const wrap = document.createElement("div");
  wrap.className = "controls-inner";
  wrap.innerHTML = `<label>Search <input id="search" type="search" placeholder="TV, AirPods, laptop…" value="${state.query}"></label>
  <label>Category <select id="filter-category"></select></label>
  <label>Store <select id="filter-store"></select></label>
  <label>Min. discount <select id="filter-discount"></select></label>
  <label>Verdict <select id="filter-verdict"></select></label>
  <label>Sort <select id="sort"></select></label>
  <button id="clear-filters" type="button">Clear</button>`;
  return wrap;
}

function wireControls() {
  const search = document.getElementById("search");
  search.addEventListener("input", () => {
    state.query = search.value;
    renderList();
  });
  document.getElementById("filter-category").addEventListener("change", (event) => {
    state.category = event.target.value;
    renderList();
  });
  document.getElementById("filter-store").addEventListener("change", (event) => {
    state.store = event.target.value;
    renderList();
  });
  document.getElementById("filter-discount").addEventListener("change", (event) => {
    state.minPct = Number(event.target.value);
    renderList();
  });
  document.getElementById("filter-verdict").addEventListener("change", (event) => {
    state.verdict = event.target.value;
    renderList();
  });
  document.getElementById("sort").addEventListener("change", (event) => {
    state.sort = event.target.value;
    document.getElementById("sort-note").textContent = "sorted by " + SORTS[state.sort].label.toLowerCase();
    renderList();
  });
  document.getElementById("clear-filters").addEventListener("click", () => {
    state.query = "";
    state.category = "All";
    state.store = "All";
    state.minPct = 0;
    state.verdict = "All";
    state.sort = "best";
    buildControls();
    wireControls();
    renderList();
  });
  buildControls();
}

// First paint: header facts, then the route.
function init() {
  document.getElementById("checked-line").textContent =
    "All prices checked " + META.checkedLabel + " · " + META.eventWindow;
  document.getElementById("deal-count").textContent = DEALS.length + " deals";
  document.getElementById("stats").innerHTML = statsBar(statsFor(DEALS));
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}

init();

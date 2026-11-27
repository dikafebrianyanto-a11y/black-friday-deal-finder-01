# DealHawk

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/dikafebrianyanto-a11y/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/dikafebrianyanto-a11y/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Black Friday deals, checked by hand. DealHawk lists 43 real Black Friday and Cyber Monday deals found and price-checked on 27 November 2026 at Amazon, Walmart and Best Buy — each with its product, store, store link, sale price, usual price, discount and check time — plus an honest verdict on whether each one is really a deal: a new low, a strong deal, a good deal, or a routine sale that is mostly marketing.

Search and filter by category, store, discount and verdict, sort by best deal first, biggest % off, biggest dollar saving or price, and open any deal for the full evidence and the same product's price at the other stores. The site is static files only: it loads nothing from any other origin and works on a desktop and on a phone.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 (or `node serve.ts --port=8090` for another port). `main.ts` hands the site in: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How the verdicts work

- **New low** — a source calls it the lowest price seen for the model.
- **Strong deal** — a deep cut, roughly 35% off or a big dollar saving on a flagship.
- **Good deal** — a solid saving.
- **Routine sale** — a thin cut; the honest label for a deal that is mostly marketing.

The score out of 100 blends the discount, the dollars saved and the verdict. Prices move fast on Black Friday — the store page is the final word, and every “View at” link goes straight there.

---

<sub>Entered on [make.fun](https://make.fun/?ref=&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>

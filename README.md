# US wine regions

Interactive proof-of-concept: major **U.S. wine states**, **California AVAs**, **Napa / Sonoma sub-AVAs**, **real climate normals** from [Open-Meteo](https://open-meteo.com/), **typical grape varieties** (educational), and a **Napa & Sonoma winery founding-year timeline** sourced from Wikidata / Wikipedia.

**Live:** https://kfguiang-spec.github.io/us-wine-regions/

Related: [WSET tasting guide](https://kfguiang-spec.github.io/wset-tasting-guide/) · [Grape lineage](https://kfguiang-spec.github.io/grape-lineage/) · [French wine regions](https://kfguiang-spec.github.io/french-wine-regions/)

## Features

- **United States** → top wine states (CA, OR, WA, NY, VA, TX, MI, PA, NM, ID)
- **Double-click California** → major AVAs / regions (Napa, Sonoma, Central Coast, Paso Robles, Santa Barbara, Mendocino, Sierra Foothills, Lodi, Monterey)
- **Double-click Napa or Sonoma** → sub-AVAs + **Winery timeline** PoC
- Soft blue→amber choropleth by growing-season mean; **°F default** with °C/°F toggle
- White/black minimal Arial UI; breadcrumb + Back navigation
- Winery age bands: **Established (pre-1970)** / **Growing (1970–1999)** / **Newer (2000–2015)** / **Emerging (2016+)** — labels describe founding-year cohorts in the dataset, not marketing claims

## Climate methodology (do not invent numbers)

Temperatures are **pre-fetched at build time** into `public/data/climate.json`.

| Item | Detail |
|------|--------|
| API | [Open-Meteo Historical Weather](https://open-meteo.com/en/docs/historical-weather-api) |
| Model | **ERA5** (`models=era5`) |
| Variable | Daily `temperature_2m_mean` (°C) |
| Period | **1991-01-01 – 2020-12-31** |
| Annual mean | Average of all daily means |
| Growing-season mean | Average of daily means for months **April–October** |
| Stations | Representative city / town per region (see JSON) |

```bash
npm run fetch:climate
```

Respect Open-Meteo free-tier rate limits (script backs off on HTTP 429; ~8s spacing).

**Citation:** Hersbach et al. (2023). ERA5 hourly data on single levels from 1940 to present. ECMWF. https://doi.org/10.24381/cds.adbb2d47 — via Open-Meteo.

## Winery founding years (never invent)

Committed in `public/data/wineries.json`:

1. Wikipedia category members: **Wineries in Napa Valley**, **Wineries in Sonoma County, California**
2. Wikidata entity via sitelink → property **P571 (inception)** when present
3. Else Wikipedia REST summary **only** when the extract explicitly says founded / established / production began in YEAR
4. If unsure → `year: null` (shown as —). Ambiguous cases (e.g. Mission-era vineyard dates) are nulled

Age-band colors and histogram are derived solely from these verified years.

## Grapes

Curated typical / primary varieties in `src/data/*.json` — educational summary (WSET-level classics), not a planting census.

## Stack

Vite + React + TypeScript. Static JSON for climate, regions, and wineries.

## Local development

```bash
npm install
npm run fetch:climate   # optional refresh
npm run dev
```

```bash
npm run build      # typecheck + production build (base /)
npm run preview
```

## Deploy (GitHub Pages)

Source on `main`. Built assets on **`gh-pages`** (Pages: branch `gh-pages` / root).

```bash
npm run deploy
# or: npm run build:pages  then publish dist/ to gh-pages
```

`VITE_BASE=/us-wine-regions/` is set by `build:pages`.

## License

App code: MIT (or as otherwise noted). Climate: Open-Meteo / ECMWF ERA5 terms. Winery metadata: Wikidata / Wikipedia CC BY-SA. Grapes: educational summary only.

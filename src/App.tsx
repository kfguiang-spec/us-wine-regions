import { useEffect, useMemo, useState } from 'react'
import caAvas from './data/california-avas.json'
import napaSubs from './data/napa-subavas.json'
import sonomaSubs from './data/sonoma-subavas.json'
import statesMeta from './data/states.json'
import { CAMap } from './components/CAMap'
import { DetailPanel } from './components/DetailPanel'
import { RegionList } from './components/RegionList'
import { SubAvaMap } from './components/SubAvaMap'
import { USMap } from './components/USMap'
import { WineriesPanel } from './components/WineriesPanel'
import type { TempUnit } from './lib/tempScale'
import type {
  ClimateFile,
  RegionMeta,
  RegionView,
  SortBy,
  ViewLevel,
  WineriesFile,
  Winery,
} from './lib/types'

const STATES = statesMeta as RegionMeta[]
const CA = caAvas as RegionMeta[]
const NAPA = napaSubs as RegionMeta[]
const SONOMA = sonomaSubs as RegionMeta[]

function sortRegions(regions: RegionView[], sortBy: SortBy): RegionView[] {
  const copy = [...regions]
  copy.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    const av = sortBy === 'annual' ? a.climate?.annual_mean_c : a.climate?.growing_season_mean_c
    const bv = sortBy === 'annual' ? b.climate?.annual_mean_c : b.climate?.growing_season_mean_c
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    return av - bv
  })
  return copy
}

const TITLES: Record<ViewLevel, string> = {
  us: 'US wine regions',
  california: 'California AVAs',
  napa: 'Napa Valley',
  sonoma: 'Sonoma County',
}

const TAGLINES: Record<ViewLevel, string> = {
  us: 'Major states · real climate normals · typical grapes',
  california: 'Major AVAs / regions · Open-Meteo · typical grapes',
  napa: 'Sub-AVAs · climate · winery timeline PoC',
  sonoma: 'Sub-AVAs · climate · winery timeline PoC',
}

export default function App() {
  const [climate, setClimate] = useState<ClimateFile | null>(null)
  const [wineries, setWineries] = useState<Winery[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewLevel>('us')
  const [selectedId, setSelectedId] = useState<string | null>('california')
  const [sortBy, setSortBy] = useState<SortBy>('growing')
  const [unit, setUnit] = useState<TempUnit>('F')
  const [showWineries, setShowWineries] = useState(false)
  const [wineryRegion, setWineryRegion] = useState<'all' | 'napa' | 'sonoma'>('all')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const base = import.meta.env.BASE_URL
        const [cRes, wRes] = await Promise.all([
          fetch(`${base}data/climate.json`),
          fetch(`${base}data/wineries.json`),
        ])
        if (!cRes.ok) throw new Error(`Failed to load climate.json (${cRes.status})`)
        const cData = (await cRes.json()) as ClimateFile
        let wData: Winery[] = []
        if (wRes.ok) {
          const wf = (await wRes.json()) as WineriesFile
          wData = wf.wineries || []
        }
        if (!cancelled) {
          setClimate(cData)
          setWineries(wData)
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const climateById = useMemo(() => {
    return new Map(climate?.regions.map((c) => [c.id, c]) ?? [])
  }, [climate])

  const withClimate = (list: RegionMeta[]): RegionView[] =>
    list.map((m) => ({ ...m, climate: climateById.get(m.id) ?? null }))

  const usRegions = useMemo(() => withClimate(STATES), [climateById])
  const caRegions = useMemo(() => withClimate(CA), [climateById])
  const napaRegions = useMemo(() => withClimate(NAPA), [climateById])
  const sonomaRegions = useMemo(() => withClimate(SONOMA), [climateById])

  const activeList =
    view === 'us' ? usRegions : view === 'california' ? caRegions : view === 'napa' ? napaRegions : sonomaRegions

  const sorted = useMemo(() => sortRegions(activeList, sortBy), [activeList, sortBy])
  const selected = activeList.find((r) => r.id === selectedId) ?? null

  function goUS() {
    setView('us')
    setSelectedId('california')
    setShowWineries(false)
  }
  function goCA() {
    setView('california')
    setSelectedId('napa')
    setShowWineries(false)
  }
  function goNapa() {
    setView('napa')
    setSelectedId(napaRegions[0]?.id ?? 'napa-rutherford')
    setShowWineries(false)
    setWineryRegion('napa')
  }
  function goSonoma() {
    setView('sonoma')
    setSelectedId(sonomaRegions[0]?.id ?? 'sonoma-russian-river')
    setShowWineries(false)
    setWineryRegion('sonoma')
  }

  function handleActivate(id: string) {
    if (view === 'us' && id === 'california') goCA()
    else if (view === 'california' && id === 'napa') goNapa()
    else if (view === 'california' && id === 'sonoma') goSonoma()
  }

  function backOne() {
    if (showWineries) {
      setShowWineries(false)
      return
    }
    if (view === 'napa' || view === 'sonoma') goCA()
    else if (view === 'california') goUS()
  }

  const activatable =
    view === 'us' ? ['california'] : view === 'california' ? ['napa', 'sonoma'] : []

  let exploreLabel: string | null = null
  let onExplore: (() => void) | undefined
  if (view === 'us' && selectedId === 'california') {
    exploreLabel = 'Explore California →'
    onExplore = goCA
  } else if (view === 'california' && selectedId === 'napa') {
    exploreLabel = 'Explore Napa Valley →'
    onExplore = goNapa
  } else if (view === 'california' && selectedId === 'sonoma') {
    exploreLabel = 'Explore Sonoma →'
    onExplore = goSonoma
  }

  const datedCount = wineries.filter((w) => w.year != null).length

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <h1>{showWineries ? 'Napa & Sonoma wineries' : TITLES[view]}</h1>
          <p className="tagline">
            {showWineries
              ? `${datedCount} verified founding years · Wikidata / Wikipedia`
              : TAGLINES[view]}
          </p>
        </div>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <button type="button" className={view === 'us' && !showWineries ? 'linkish current' : 'linkish'} onClick={goUS}>
            United States
          </button>
          {view !== 'us' || showWineries ? (
            <>
              <span className="sep">→</span>
              <button
                type="button"
                className={view === 'california' && !showWineries ? 'linkish current' : 'linkish'}
                onClick={goCA}
              >
                California
              </button>
            </>
          ) : null}
          {(view === 'napa' || (showWineries && wineryRegion === 'napa')) && (
            <>
              <span className="sep">→</span>
              <button type="button" className="linkish" onClick={goNapa}>
                Napa Valley
              </button>
            </>
          )}
          {(view === 'sonoma' || (showWineries && wineryRegion === 'sonoma')) && (
            <>
              <span className="sep">→</span>
              <button type="button" className="linkish" onClick={goSonoma}>
                Sonoma
              </button>
            </>
          )}
          {showWineries ? (
            <>
              <span className="sep">→</span>
              <span>Wineries</span>
            </>
          ) : null}
          {view !== 'us' || showWineries ? (
            <button type="button" className="back-btn" onClick={backOne}>
              ← Back
            </button>
          ) : null}
        </nav>
        <div className="header-controls">
          <nav className="toolbar" aria-label="Related projects">
            <a href="https://kfguiang-spec.github.io/wset-tasting-guide/">WSET tasting guide</a>
            <span className="sep">·</span>
            <a href="https://kfguiang-spec.github.io/grape-lineage/">Grape lineage</a>
            <span className="sep">·</span>
            <a href="https://kfguiang-spec.github.io/french-wine-regions/">French wine regions</a>
          </nav>
          <div className="unit-toggle" role="group" aria-label="Temperature unit">
            <span className="muted">Temp:</span>
            <button
              type="button"
              className={unit === 'F' ? 'active' : ''}
              aria-pressed={unit === 'F'}
              onClick={() => setUnit('F')}
            >
              °F
            </button>
            <button
              type="button"
              className={unit === 'C' ? 'active' : ''}
              aria-pressed={unit === 'C'}
              onClick={() => setUnit('C')}
            >
              °C
            </button>
          </div>
        </div>
      </header>

      {loading ? <p className="banner muted">Loading data…</p> : null}
      {loadError ? <p className="banner error">{loadError}</p> : null}

      <main className={`main ${showWineries ? 'main-wineries' : ''}`}>
        {showWineries ? (
          <>
            <section className="list-panel winery-main" aria-label="Winery timeline">
              <WineriesPanel
                wineries={wineries}
                regionFilter={wineryRegion}
                onRegionFilter={setWineryRegion}
              />
            </section>
            <DetailPanel region={null} unit={unit} climateMeta={null} wineriesMode />
          </>
        ) : (
          <>
            <section className="map-panel" aria-label="Map">
              {view === 'us' ? (
                <USMap
                  regions={usRegions}
                  selectedId={selectedId}
                  unit={unit}
                  onSelect={setSelectedId}
                  onActivate={handleActivate}
                />
              ) : view === 'california' ? (
                <CAMap
                  regions={caRegions}
                  selectedId={selectedId}
                  unit={unit}
                  onSelect={setSelectedId}
                  onActivate={handleActivate}
                />
              ) : (
                <SubAvaMap
                  regions={view === 'napa' ? napaRegions : sonomaRegions}
                  selectedId={selectedId}
                  unit={unit}
                  mode={view}
                  onSelect={setSelectedId}
                />
              )}
              <p className="map-hint muted">
                {view === 'us'
                  ? 'Single-click selects. Double-click California (or Explore) for AVAs.'
                  : view === 'california'
                    ? 'Double-click Napa or Sonoma for sub-AVAs and winery timeline.'
                    : 'Click a sub-AVA. Use Winery timeline for founding-year PoC.'}
              </p>
            </section>

            <section className="list-panel" aria-label="Region list">
              <RegionList
                regions={sorted}
                selectedId={selectedId}
                sortBy={sortBy}
                unit={unit}
                onSelect={setSelectedId}
                onSort={setSortBy}
                onActivate={activatable.length ? handleActivate : undefined}
                activatableIds={activatable}
                hint={
                  view === 'us'
                    ? 'double-click CA to drill down'
                    : view === 'california'
                      ? 'double-click Napa/Sonoma'
                      : undefined
                }
              />
            </section>

            <DetailPanel
              region={selected}
              unit={unit}
              exploreLabel={exploreLabel}
              onExplore={onExplore}
              showWineries={view === 'napa' || view === 'sonoma'}
              onShowWineries={() => {
                setWineryRegion(view === 'napa' ? 'napa' : 'sonoma')
                setShowWineries(true)
              }}
              climateMeta={
                climate
                  ? {
                      source: climate.source,
                      methodology: climate.methodology,
                      fetched_at: climate.fetched_at,
                    }
                  : null
              }
            />
          </>
        )}
      </main>

      <footer className="footer">
        <p>
          <a href="https://kfguiang-spec.github.io/wset-tasting-guide/">WSET tasting guide</a>
          {' · '}
          <a href="https://kfguiang-spec.github.io/grape-lineage/">Grape lineage</a>
          {' · '}
          <a href="https://kfguiang-spec.github.io/french-wine-regions/">French wine regions</a>
        </p>
        <p>
          Climate: <a href="https://open-meteo.com/">Open-Meteo</a> Historical Weather API (ERA5),
          1991–2020 daily means — <code>public/data/climate.json</code> (stored °C; display converts).{' '}
          {climate ? (
            <>
              Period {climate.regions[0]?.period.start}–{climate.regions[0]?.period.end}.
            </>
          ) : null}
        </p>
        <p className="muted">
          Wineries: Wikipedia category members + Wikidata inception (<code>P571</code>) and explicit
          founded/established years from Wikipedia REST summaries only. No fabricated dates. Attribution:{' '}
          <a href="https://www.wikidata.org/">Wikidata</a> / Wikipedia CC BY-SA.
        </p>
        <p className="muted">
          {climate?.citation ??
            'ERA5 via Open-Meteo. Cite Hersbach et al. (2023), doi:10.24381/cds.adbb2d47.'}
        </p>
      </footer>
    </div>
  )
}

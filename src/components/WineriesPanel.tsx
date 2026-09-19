import { useMemo, useState } from 'react'
import { AGE_BANDS, ageBandForYear, bandMeta, histogramByDecade } from '../lib/ageBands'
import type { AgeBand, Winery } from '../lib/types'

type Props = {
  wineries: Winery[]
  regionFilter: 'all' | 'napa' | 'sonoma'
  onRegionFilter: (r: 'all' | 'napa' | 'sonoma') => void
}

export function WineriesPanel({ wineries, regionFilter, onRegionFilter }: Props) {
  const [bandFilter, setBandFilter] = useState<AgeBand | 'all'>('all')
  const [showUnknown, setShowUnknown] = useState(false)

  const filtered = useMemo(() => {
    return wineries.filter((w) => {
      if (regionFilter !== 'all' && !w.regions.includes(regionFilter)) return false
      const band = ageBandForYear(w.year)
      if (bandFilter !== 'all' && band !== bandFilter) return false
      if (!showUnknown && w.year == null) return false
      return true
    })
  }, [wineries, regionFilter, bandFilter, showUnknown])

  const withYears = filtered.filter((w) => w.year != null)
  const hist = histogramByDecade(filtered)
  const maxCount = Math.max(1, ...hist.map((h) => h.count))

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.year == null && b.year == null) return a.name.localeCompare(b.name)
      if (a.year == null) return 1
      if (b.year == null) return -1
      return a.year - b.year || a.name.localeCompare(b.name)
    })
  }, [filtered])

  return (
    <div className="wineries-panel">
      <div className="list-toolbar">
        <span className="muted">Region:</span>
        {(['all', 'napa', 'sonoma'] as const).map((r) => (
          <button
            key={r}
            type="button"
            className={regionFilter === r ? 'active' : ''}
            onClick={() => onRegionFilter(r)}
          >
            {r === 'all' ? 'Both' : r === 'napa' ? 'Napa' : 'Sonoma'}
          </button>
        ))}
      </div>
      <div className="list-toolbar">
        <span className="muted">Age band:</span>
        <button
          type="button"
          className={bandFilter === 'all' ? 'active' : ''}
          onClick={() => setBandFilter('all')}
        >
          All
        </button>
        {AGE_BANDS.filter((b) => b.id !== 'unknown').map((b) => (
          <button
            key={b.id}
            type="button"
            className={bandFilter === b.id ? 'active' : ''}
            onClick={() => setBandFilter(b.id)}
            title={b.label}
          >
            {b.short}
          </button>
        ))}
        <label className="check-label muted">
          <input
            type="checkbox"
            checked={showUnknown}
            onChange={(e) => setShowUnknown(e.target.checked)}
          />{' '}
          Show year-unknown
        </label>
      </div>

      <p className="list-units muted">
        {withYears.length} with verified founding year
        {showUnknown ? ` · ${filtered.length - withYears.length} unknown` : ''} of {wineries.length}{' '}
        listed · bands = dataset age, not marketing
      </p>

      <h3>Founding by decade</h3>
      <div className="histogram" aria-label="Histogram of winery founding decades">
        {hist.length === 0 ? (
          <p className="muted">No dated wineries in current filter.</p>
        ) : (
          hist.map((h) => {
            const meta = bandMeta(h.band)
            return (
              <div key={h.decade} className="hist-row">
                <span className="hist-label">{h.decade}s</span>
                <div className="hist-bar-wrap">
                  <div
                    className="hist-bar"
                    style={{
                      width: `${(h.count / maxCount) * 100}%`,
                      background: meta.color,
                    }}
                    title={`${h.count} · ${meta.label}`}
                  />
                </div>
                <span className="hist-count">{h.count}</span>
              </div>
            )
          })
        )}
      </div>

      <div className="band-legend">
        {AGE_BANDS.filter((b) => b.id !== 'unknown').map((b) => (
          <span key={b.id} className="band-chip">
            <span className="swatch" style={{ background: b.color }} />
            {b.label}
          </span>
        ))}
      </div>

      <h3>Timeline / list</h3>
      <ul className="winery-list">
        {sorted.map((w) => {
          const band = ageBandForYear(w.year)
          const meta = bandMeta(band)
          return (
            <li key={w.id} className="winery-row">
              <span className="winery-year" style={{ borderColor: meta.color }}>
                {w.year ?? '—'}
              </span>
              <span className="winery-body">
                <span className="winery-name">
                  {w.wikipedia_url ? (
                    <a href={w.wikipedia_url} target="_blank" rel="noreferrer">
                      {w.name}
                    </a>
                  ) : (
                    w.name
                  )}
                </span>
                <span className="muted winery-meta">
                  {w.regions.map((r) => (r === 'napa' ? 'Napa' : 'Sonoma')).join(', ')}
                  {' · '}
                  <span style={{ color: meta.color }}>{meta.short}</span>
                  {w.source ? ` · ${w.source}` : ' · year unknown'}
                  {w.wikidata_url ? (
                    <>
                      {' · '}
                      <a href={w.wikidata_url} target="_blank" rel="noreferrer">
                        Wikidata
                      </a>
                    </>
                  ) : null}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

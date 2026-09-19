import type { RegionView } from '../lib/types'
import { formatTemp, type TempUnit, unitLabel } from '../lib/tempScale'

type Props = {
  region: RegionView | null
  unit: TempUnit
  climateMeta: { source: string; methodology: string; fetched_at: string } | null
  exploreLabel?: string | null
  onExplore?: () => void
  showWineries?: boolean
  onShowWineries?: () => void
  wineriesMode?: boolean
}

export function DetailPanel({
  region,
  unit,
  climateMeta,
  exploreLabel,
  onExplore,
  showWineries,
  onShowWineries,
  wineriesMode,
}: Props) {
  if (wineriesMode) {
    return (
      <aside className="detail">
        <h2>Wineries PoC</h2>
        <p className="blurb">
          Notable Napa and Sonoma wineries from Wikipedia categories, with founding years only when
          verified via Wikidata <code>P571</code> (inception) or an explicit founded/established year
          in the Wikipedia REST summary. Years are never invented — unknown years show as blank.
        </p>
        <p className="data-note muted">
          Age bands (Established / Growing / Newer / Emerging) are relative to founding year in this
          dataset, not a quality or marketing claim.
        </p>
      </aside>
    )
  }

  if (!region) {
    return (
      <aside className="detail">
        <p className="muted">
          Select a region on the map or in the list to see temperatures and typical grapes.
        </p>
      </aside>
    )
  }

  const c = region.climate
  const u = unitLabel(unit)
  return (
    <aside className="detail">
      <h2>
        {region.name}
        {region.short ? <span className="muted"> · {region.short}</span> : null}
      </h2>
      <p className="blurb">{region.blurb}</p>

      {exploreLabel && onExplore ? (
        <p className="explore-row">
          <button type="button" className="explore-btn" onClick={onExplore}>
            {exploreLabel}
          </button>
          <span className="muted explore-hint">or double-click the map/list marker</span>
        </p>
      ) : null}

      {showWineries && onShowWineries ? (
        <p className="explore-row">
          <button type="button" className="explore-btn secondary" onClick={onShowWineries}>
            Winery timeline →
          </button>
        </p>
      ) : null}

      <h3>Temperature ({u})</h3>
      {c ? (
        <dl className="temp-dl">
          <div>
            <dt>Annual mean</dt>
            <dd>{formatTemp(c.annual_mean_c, unit)}</dd>
          </div>
          <div>
            <dt>Growing season ({c.growing_season_months})</dt>
            <dd>{formatTemp(c.growing_season_mean_c, unit)}</dd>
          </div>
          <div>
            <dt>Station (representative)</dt>
            <dd>
              {c.station} ({c.requested.lat.toFixed(2)}°N, {Math.abs(c.requested.lon).toFixed(2)}°W)
            </dd>
          </div>
          <div>
            <dt>Period / model</dt>
            <dd>
              {c.period.start} – {c.period.end} · {c.model.toUpperCase()}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="error">Climate data missing for this region.</p>
      )}
      {climateMeta ? (
        <p className="data-note muted">
          Means from daily 2&nbsp;m air temperature via Open-Meteo (ERA5), stored in °C and converted
          for display ({u}). Pre-fetched at build time for reproducibility.
        </p>
      ) : null}

      <h3>Typical grape varieties</h3>
      <p className="data-note muted">
        Educational summary of primary / classic varieties — not an exhaustive planting list.
      </p>
      <div className="grape-cols">
        <div>
          <h4>Red</h4>
          {region.red.length ? (
            <ul>
              {region.red.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">—</p>
          )}
        </div>
        <div>
          <h4>White</h4>
          {region.white.length ? (
            <ul>
              {region.white.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">— (primarily red)</p>
          )}
        </div>
      </div>
    </aside>
  )
}

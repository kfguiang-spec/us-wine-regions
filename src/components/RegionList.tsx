import type { RegionView, SortBy } from '../lib/types'
import { formatTemp, type TempUnit, unitLabel } from '../lib/tempScale'

type Props = {
  regions: RegionView[]
  selectedId: string | null
  sortBy: SortBy
  unit: TempUnit
  onSelect: (id: string) => void
  onSort: (s: SortBy) => void
  onActivate?: (id: string) => void
  activatableIds?: string[]
  hint?: string
}

export function RegionList({
  regions,
  selectedId,
  sortBy,
  unit,
  onSelect,
  onSort,
  onActivate,
  activatableIds = [],
  hint,
}: Props) {
  const u = unitLabel(unit)
  return (
    <div className="region-list">
      <div className="list-toolbar">
        <span className="muted">Sort:</span>
        <button type="button" className={sortBy === 'name' ? 'active' : ''} onClick={() => onSort('name')}>
          Name
        </button>
        <button
          type="button"
          className={sortBy === 'annual' ? 'active' : ''}
          onClick={() => onSort('annual')}
        >
          Annual {u}
        </button>
        <button
          type="button"
          className={sortBy === 'growing' ? 'active' : ''}
          onClick={() => onSort('growing')}
        >
          Growing {u}
        </button>
      </div>
      <p className="list-units muted">
        Shown: annual · growing season ({u})
        {hint ? ` · ${hint}` : ''}
      </p>
      <ul>
        {regions.map((r) => {
          const canActivate = activatableIds.includes(r.id) || !!r.drillable
          return (
            <li key={r.id}>
              <button
                type="button"
                className={`region-row ${r.id === selectedId ? 'selected' : ''}`}
                onClick={() => onSelect(r.id)}
                onDoubleClick={(e) => {
                  e.preventDefault()
                  if (canActivate && onActivate) onActivate(r.id)
                }}
                title={canActivate ? 'Double-click to explore' : undefined}
              >
                <span className="region-name">
                  {r.name}
                  {r.short ? <span className="muted fr"> ({r.short})</span> : null}
                  {canActivate ? <span className="drill-hint muted"> ↗</span> : null}
                </span>
                <span className="temps">
                  <span title={`Annual mean 1991–2020 (${u})`}>
                    {formatTemp(r.climate?.annual_mean_c, unit)}
                  </span>
                  <span className="sep">·</span>
                  <span title={`Growing season Apr–Oct mean (${u})`}>
                    {formatTemp(r.climate?.growing_season_mean_c, unit)}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

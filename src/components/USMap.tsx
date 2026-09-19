import type { RegionView } from '../lib/types'
import { projectUS } from '../lib/geo'
import { formatTemp, tempFill, type TempUnit, unitLabel } from '../lib/tempScale'

type Props = {
  regions: RegionView[]
  selectedId: string | null
  unit: TempUnit
  onSelect: (id: string) => void
  onActivate: (id: string) => void
}

export function USMap({ regions, selectedId, unit, onSelect, onActivate }: Props) {
  return (
    <svg
      className="region-map"
      viewBox="0 0 520 360"
      role="img"
      aria-label="Map of major U.S. wine states colored by growing-season temperature"
    >
      <rect x="0" y="0" width="520" height="320" fill="#fafafa" stroke="#111" strokeWidth="1" />
      <text x="12" y="18" fontSize="11" fill="#888">
        Contiguous U.S. (schematic)
      </text>
      {regions.map((r) => {
        const { x, y } = projectUS(r.lon, r.lat)
        const selected = r.id === selectedId
        const grow = r.climate?.growing_season_mean_c
        const rRadius = selected ? 14 : 11
        return (
          <g
            key={r.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(r.id)}
            onDoubleClick={(e) => {
              e.preventDefault()
              onActivate(r.id)
            }}
          >
            <circle
              cx={x}
              cy={y}
              r={rRadius}
              fill={tempFill(grow, selected)}
              stroke="#111"
              strokeWidth={selected ? 2.5 : 1.25}
            />
            <title>
              {r.name}: growing season {formatTemp(grow, unit)}
              {r.drillable ? ' — double-click to explore' : ''}
            </title>
            <text x={x} y={y + rRadius + 12} textAnchor="middle" className="map-label" fontSize="9" fill="#111">
              {r.short || r.name}
            </text>
          </g>
        )
      })}
      <g transform="translate(12, 330)">
        <text fontSize="10" fill="#666">
          Growing season (Apr–Oct) {unitLabel(unit)} — cooler → warmer
        </text>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={i * 22}
            y={14}
            width={20}
            height={10}
            fill={tempFill(12 + i * 3, false)}
            stroke="#111"
            strokeWidth="0.5"
          />
        ))}
      </g>
    </svg>
  )
}

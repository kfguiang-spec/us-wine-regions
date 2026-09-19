import type { RegionView } from '../lib/types'
import { projectCA } from '../lib/geo'
import { formatTemp, tempFill, type TempUnit, unitLabel } from '../lib/tempScale'

type Props = {
  regions: RegionView[]
  selectedId: string | null
  unit: TempUnit
  onSelect: (id: string) => void
  onActivate: (id: string) => void
}

export function CAMap({ regions, selectedId, unit, onSelect, onActivate }: Props) {
  return (
    <svg
      className="region-map"
      viewBox="0 0 300 450"
      role="img"
      aria-label="Map of California AVAs colored by growing-season temperature"
    >
      <rect x="0" y="0" width="280" height="420" fill="#fafafa" stroke="#111" strokeWidth="1" />
      <text x="10" y="18" fontSize="11" fill="#888">
        California (schematic)
      </text>
      {regions.map((r) => {
        const { x, y } = projectCA(r.lon, r.lat)
        const selected = r.id === selectedId
        const grow = r.climate?.growing_season_mean_c
        const rRadius = selected ? 13 : 10
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
              {r.name}: {formatTemp(grow, unit)}
              {r.drillable ? ' — double-click' : ''}
            </title>
            <text x={x} y={y + rRadius + 11} textAnchor="middle" fontSize="8" fill="#111">
              {r.name.length > 14 ? r.name.slice(0, 12) + '…' : r.name}
            </text>
          </g>
        )
      })}
      <g transform="translate(10, 428)">
        <text fontSize="9" fill="#666">
          Growing {unitLabel(unit)} cooler → warmer
        </text>
      </g>
    </svg>
  )
}

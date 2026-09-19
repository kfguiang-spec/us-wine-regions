import type { RegionView } from '../lib/types'
import { projectNapa, projectSonoma } from '../lib/geo'
import { formatTemp, tempFill, type TempUnit } from '../lib/tempScale'

type Props = {
  regions: RegionView[]
  selectedId: string | null
  unit: TempUnit
  mode: 'napa' | 'sonoma'
  onSelect: (id: string) => void
}

export function SubAvaMap({ regions, selectedId, unit, mode, onSelect }: Props) {
  const project = mode === 'napa' ? projectNapa : projectSonoma
  const vb = mode === 'napa' ? '0 0 300 420' : '0 0 340 400'
  return (
    <svg className="region-map" viewBox={vb} role="img" aria-label={`${mode} sub-AVAs`}>
      <rect
        x="0"
        y="0"
        width={mode === 'napa' ? 280 : 320}
        height={mode === 'napa' ? 400 : 380}
        fill="#fafafa"
        stroke="#111"
        strokeWidth="1"
      />
      <text x="10" y="18" fontSize="11" fill="#888">
        {mode === 'napa' ? 'Napa Valley' : 'Sonoma County'} (schematic)
      </text>
      {regions.map((r) => {
        const { x, y } = project(r.lon, r.lat)
        const selected = r.id === selectedId
        const grow = r.climate?.growing_season_mean_c
        const rRadius = selected ? 12 : 9
        return (
          <g key={r.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(r.id)}>
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
            </title>
            <text x={x} y={y + rRadius + 10} textAnchor="middle" fontSize="7.5" fill="#111">
              {r.name.length > 16 ? r.name.slice(0, 14) + '…' : r.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

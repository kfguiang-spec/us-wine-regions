import type { AgeBand, Winery } from './types'

/** Age bands by founding year — dataset-relative labels, not marketing claims. */
export const AGE_BANDS: {
  id: AgeBand
  label: string
  short: string
  min: number | null
  max: number | null
  color: string
}[] = [
  { id: 'established', label: 'Established (pre-1970)', short: 'Established', min: null, max: 1969, color: '#3d5a80' },
  { id: 'growing', label: 'Growing (1970–1999)', short: 'Growing', min: 1970, max: 1999, color: '#6b8f71' },
  { id: 'newer', label: 'Newer (2000–2015)', short: 'Newer', min: 2000, max: 2015, color: '#c9a227' },
  { id: 'emerging', label: 'Emerging (2016+)', short: 'Emerging', min: 2016, max: null, color: '#d97757' },
  { id: 'unknown', label: 'Year unknown', short: 'Unknown', min: null, max: null, color: '#bbbbbb' },
]

export function ageBandForYear(year: number | null | undefined): AgeBand {
  if (year == null) return 'unknown'
  if (year < 1970) return 'established'
  if (year <= 1999) return 'growing'
  if (year <= 2015) return 'newer'
  return 'emerging'
}

export function bandMeta(band: AgeBand) {
  return AGE_BANDS.find((b) => b.id === band)!
}

export function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10
}

export function histogramByDecade(wineries: Winery[]): { decade: number; count: number; band: AgeBand }[] {
  const withYear = wineries.filter((w) => w.year != null) as (Winery & { year: number })[]
  const map = new Map<number, number>()
  for (const w of withYear) {
    const d = decadeOf(w.year)
    map.set(d, (map.get(d) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([decade, count]) => ({
      decade,
      count,
      band: ageBandForYear(decade + 5),
    }))
}

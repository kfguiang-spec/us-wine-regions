export type RegionMeta = {
  id: string
  name: string
  short?: string
  station: string
  lat: number
  lon: number
  blurb: string
  red: string[]
  white: string[]
  parentId?: string
  drillable?: boolean
}

export type ClimateRegion = {
  id: string
  station: string
  requested: { lat: number; lon: number }
  grid: { latitude: number; longitude: number; elevation_m: number }
  period: { start: string; end: string }
  model: string
  units: string
  annual_mean_c: number
  growing_season_mean_c: number
  growing_season_months: string
  sample_days: number
  growing_season_days: number
}

export type ClimateFile = {
  fetched_at: string
  source: string
  attribution: string
  citation: string
  methodology: string
  regions: ClimateRegion[]
}

export type RegionView = RegionMeta & {
  climate: ClimateRegion | null
}

/** Navigation stack levels */
export type ViewLevel = 'us' | 'california' | 'napa' | 'sonoma'

export type Winery = {
  id: string
  name: string
  wikipedia_title: string | null
  year: number | null
  regions: Array<'napa' | 'sonoma'>
  source: string | null
  wikidata_url: string | null
  wikipedia_url: string | null
}

export type WineriesFile = {
  fetched_at: string
  methodology: string
  attribution: string
  wineries: Winery[]
}

export type AgeBand = 'established' | 'growing' | 'newer' | 'emerging' | 'unknown'

export type SortBy = 'name' | 'annual' | 'growing'

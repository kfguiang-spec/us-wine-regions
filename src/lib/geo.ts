/** Contiguous US equirectangular schematic. */
const US_LON0 = -125
const US_LON1 = -66
const US_LAT0 = 24
const US_LAT1 = 50

export function projectUS(lon: number, lat: number): { x: number; y: number } {
  const x = ((lon - US_LON0) / (US_LON1 - US_LON0)) * 520
  const y = ((US_LAT1 - lat) / (US_LAT1 - US_LAT0)) * 320
  return { x, y }
}

/** California schematic. */
const CA_LON0 = -124.5
const CA_LON1 = -114
const CA_LAT0 = 32.5
const CA_LAT1 = 42.1

export function projectCA(lon: number, lat: number): { x: number; y: number } {
  const x = ((lon - CA_LON0) / (CA_LON1 - CA_LON0)) * 280
  const y = ((CA_LAT1 - lat) / (CA_LAT1 - CA_LAT0)) * 420
  return { x, y }
}

/** Napa Valley zoom. */
const NP_LON0 = -122.6
const NP_LON1 = -122.15
const NP_LAT0 = 38.2
const NP_LAT1 = 38.65

export function projectNapa(lon: number, lat: number): { x: number; y: number } {
  const x = ((lon - NP_LON0) / (NP_LON1 - NP_LON0)) * 280
  const y = ((NP_LAT1 - lat) / (NP_LAT1 - NP_LAT0)) * 400
  return { x, y }
}

/** Sonoma County zoom. */
const SO_LON0 = -123.2
const SO_LON1 = -122.3
const SO_LAT0 = 38.15
const SO_LAT1 = 38.85

export function projectSonoma(lon: number, lat: number): { x: number; y: number } {
  const x = ((lon - SO_LON0) / (SO_LON1 - SO_LON0)) * 320
  const y = ((SO_LAT1 - lat) / (SO_LAT1 - SO_LAT0)) * 380
  return { x, y }
}

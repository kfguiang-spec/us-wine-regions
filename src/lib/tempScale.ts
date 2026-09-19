export type TempUnit = 'C' | 'F'

/** Source climate.json stores °C; display conversion only. */
export function cToF(c: number): number {
  return (c * 9) / 5 + 32
}

export function toDisplay(c: number | null | undefined, unit: TempUnit): number | null {
  if (c == null || Number.isNaN(c)) return null
  return unit === 'F' ? cToF(c) : c
}

export function formatTemp(c: number | null | undefined, unit: TempUnit): string {
  const v = toDisplay(c, unit)
  if (v == null) return '—'
  return `${v.toFixed(1)} °${unit}`
}

export function unitLabel(unit: TempUnit): string {
  return unit === 'F' ? '°F' : '°C'
}

/**
 * Soft cool→warm choropleth (light blue → soft amber).
 * Input is always growing-season °C from climate.json.
 * US station range roughly ~12–24 °C growing season.
 */
export function tempFill(cCelsius: number | null | undefined, selected: boolean): string {
  if (cCelsius == null) return selected ? '#d8d8d8' : '#f0f0f0'
  const t = Math.min(1, Math.max(0, (cCelsius - 12) / 12))
  const stops: [number, number, number][] = [
    [176, 208, 232],
    [168, 212, 200],
    [232, 220, 168],
    [232, 188, 128],
    [220, 152, 96],
  ]
  const seg = t * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(seg))
  const f = seg - i
  const a = stops[i]
  const b = stops[i + 1]
  let r = Math.round(a[0] + (b[0] - a[0]) * f)
  let g = Math.round(a[1] + (b[1] - a[1]) * f)
  let bl = Math.round(a[2] + (b[2] - a[2]) * f)
  if (selected) {
    r = Math.max(0, r - 28)
    g = Math.max(0, g - 28)
    bl = Math.max(0, bl - 28)
  }
  return `rgb(${r}, ${g}, ${bl})`
}

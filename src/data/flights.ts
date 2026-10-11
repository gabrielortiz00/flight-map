import airportData from './airports.json'
import routeData from './routes.json'

export type Airport = {
  ident: string
  name: string
  city: string
  state: string
  lat: number
  lon: number
  elevFt: number
  /** Only local flights (takeoff and landing here), no cross-country legs. */
  localOnly: boolean
}

export type Leg = { from: Airport; to: Airport }

const byIdent: Record<string, Omit<Airport, 'ident' | 'localOnly'>> = airportData.airports

const legKeys = new Set<string>()
for (const route of routeData.routes) {
  for (let i = 1; i < route.length; i++) {
    // A leg flown in either direction is drawn once.
    legKeys.add([route[i - 1], route[i]].sort().join('-'))
  }
}
const routed = new Set([...legKeys].flatMap((k) => k.split('-')))

// FAA data is upper case ("SAN LUIS OBISPO"); the airport name stays that way, as on charts.
const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

export const airports: Airport[] = Object.entries(byIdent).map(([ident, a]) => ({
  ...a,
  city: titleCase(a.city),
  ident,
  localOnly: !routed.has(ident),
}))

const find = (ident: string) => airports.find((a) => a.ident === ident)!

export const legs: Leg[] = [...legKeys].map((k) => {
  const [a, b] = k.split('-')
  return { from: find(a), to: find(b) }
})

// Looks up every airport referenced in src/data/routes.json in the FAA NASR
// APT_BASE.csv and writes their coordinates to src/data/airports.json.
//
// Usage: node scripts/airports.mjs faa/APT_BASE.csv
// Get APT_BASE.csv from the "APT_CSV" zip on the FAA NASR subscription page:
// https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/

import { readFileSync, writeFileSync } from 'node:fs'

const ROUTES = new URL('../src/data/routes.json', import.meta.url)
const OUT = new URL('../src/data/airports.json', import.meta.url)

// RFC 4180 CSV: quoted fields may contain commas, quotes ("") and newlines.
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') {
        quoted = false
      } else {
        field += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  if (field || row.length) rows.push([...row, field])
  return rows
}

const aptPath = process.argv[2]
if (!aptPath) {
  console.error('Usage: node scripts/airports.mjs <path to APT_BASE.csv>')
  process.exit(1)
}

const { routes, local } = JSON.parse(readFileSync(ROUTES, 'utf8'))
const wanted = new Set([...routes.flat(), ...local])

const [header, ...records] = parseCsv(readFileSync(aptPath, 'utf8'))
const col = Object.fromEntries(header.map((name, i) => [name, i]))
for (const name of ['ARPT_ID', 'ICAO_ID', 'ARPT_NAME', 'CITY', 'STATE_CODE', 'LAT_DECIMAL', 'LONG_DECIMAL', 'ELEV', 'EFF_DATE']) {
  if (!(name in col)) throw new Error(`APT_BASE.csv is missing column ${name}`)
}

// Logbooks use the ICAO code when there is one (KHWD) and the FAA identifier
// otherwise (C83), so index both.
const byIdent = new Map()
for (const r of records) {
  if (r.length !== header.length) continue
  if (r[col.ICAO_ID]) byIdent.set(r[col.ICAO_ID], r)
  byIdent.set(r[col.ARPT_ID], r)
}

const airports = {}
const missing = []
for (const ident of [...wanted].sort()) {
  const r = byIdent.get(ident)
  if (!r) {
    missing.push(ident)
    continue
  }
  airports[ident] = {
    name: r[col.ARPT_NAME],
    city: r[col.CITY],
    state: r[col.STATE_CODE],
    lat: Number(r[col.LAT_DECIMAL]),
    lon: Number(r[col.LONG_DECIMAL]),
    elevFt: Number(r[col.ELEV]),
  }
}
if (missing.length) {
  console.error(`Not found in ${aptPath}: ${missing.join(', ')}`)
  process.exit(1)
}

writeFileSync(OUT, JSON.stringify({ source: `FAA NASR, effective ${records[0][col.EFF_DATE]}`, airports }, null, 2) + '\n')
console.log(`Wrote ${Object.keys(airports).length} airports to src/data/airports.json`)

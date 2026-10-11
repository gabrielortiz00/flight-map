import { airports, type Airport } from './data/flights'
import './AirportList.css'

// Routed airports first, then local-only, each alphabetical.
const sorted = [...airports].sort(
  (a, b) => Number(a.localOnly) - Number(b.localOnly) || a.ident.localeCompare(b.ident),
)

type Props = {
  onSelect: (a: Airport) => void
  onShowAll: () => void
}

export function AirportList({ onSelect, onShowAll }: Props) {
  return (
    <aside className="panel">
      <header className="panel-header">
        <h1>Flights</h1>
        <button type="button" className="show-all" onClick={onShowAll}>
          All routes
        </button>
        <a href="https://gabrielortiz.io">gabrielortiz.io</a>
      </header>
      <ol className="airports">
        {sorted.map((a) => (
          <li key={a.ident}>
            <button type="button" onClick={() => onSelect(a)}>
              <span className={a.localOnly ? 'marker hollow' : 'marker'} aria-hidden />
              <span className="ident">{a.ident}</span>
              <span className="place">
                {a.city}, {a.state}
                {a.localOnly && <span className="note"> · local flights only</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  )
}

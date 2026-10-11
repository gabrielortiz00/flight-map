import { FlyToInterpolator, WebMercatorViewport, type MapViewState } from '@deck.gl/core'
import { airports, type Airport } from '../data/flights'

// Keep routes clear of the airport panel (AirportList.css): it sits top-left on
// wide screens and along the bottom on phones.
function framePadding() {
  if (window.innerWidth <= 600) return { top: 48, right: 48, bottom: 360, left: 48 }
  return { top: 80, right: 80, bottom: 80, left: 380 }
}

// Open on the cross-country flying; airports elsewhere are reachable from the list.
export function initialView({ animate = false } = {}): MapViewState {
  const routed = airports.filter((a) => !a.localOnly)
  const lons = routed.map((a) => a.lon)
  const lats = routed.map((a) => a.lat)
  const viewport = new WebMercatorViewport({ width: window.innerWidth, height: window.innerHeight })
  const { longitude, latitude, zoom } = viewport.fitBounds(
    [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ],
    { padding: framePadding() },
  )
  const transition = animate
    ? { transitionDuration: 'auto' as const, transitionInterpolator: new FlyToInterpolator({ speed: 2 }) }
    : {}
  return { longitude, latitude, zoom, ...transition }
}

export function flyTo(a: Airport): MapViewState {
  return {
    longitude: a.lon,
    latitude: a.lat,
    zoom: 10,
    transitionDuration: 'auto',
    transitionInterpolator: new FlyToInterpolator({ speed: 2 }),
  }
}

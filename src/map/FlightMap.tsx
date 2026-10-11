import { ScatterplotLayer } from '@deck.gl/layers'
import DeckGL from '@deck.gl/react'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import Map from 'react-map-gl/maplibre'
import { useColorScheme } from './useColorScheme'

// MapLibre locates its worker relative to its own module URL, which breaks once
// Vite bundles it. Hand it the worker's real URL instead.
setWorkerUrl(workerUrl)

// OpenFreeMap: free vector tiles, no API key.
const STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
}

const HOME = { icao: 'KHWD', longitude: -122.1217, latitude: 37.6589 }

export function FlightMap() {
  const scheme = useColorScheme()

  const layers = [
    new ScatterplotLayer({
      id: 'home-airport',
      data: [HOME],
      getPosition: (d) => [d.longitude, d.latitude],
      getRadius: 6,
      radiusUnits: 'pixels',
      getFillColor: scheme === 'dark' ? [224, 87, 79] : [200, 50, 43],
    }),
  ]

  // deck.gl owns the camera and input; MapLibre only draws the base map beneath it.
  return (
    <DeckGL
      initialViewState={{ longitude: HOME.longitude, latitude: HOME.latitude, zoom: 8 }}
      controller
      layers={layers}
    >
      <Map mapStyle={STYLES[scheme]} />
    </DeckGL>
  )
}

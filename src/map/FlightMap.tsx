import type { MapViewState } from '@deck.gl/core'
import { LineLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers'
import DeckGL from '@deck.gl/react'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { useEffect, useState } from 'react'
import Map from 'react-map-gl/maplibre'
import { airports, legs, type Airport } from '../data/flights'
import { useColorScheme } from './useColorScheme'

// MapLibre locates its worker relative to its own module URL, which breaks once
// Vite bundles it. Hand it the worker's real URL instead.
setWorkerUrl(workerUrl)

// OpenFreeMap: free vector tiles, no API key.
const STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
}

type RGB = [number, number, number]
const COLORS: Record<'light' | 'dark', { ink: RGB; accent: RGB; paper: RGB }> = {
  light: { ink: [22, 38, 61], accent: [200, 50, 43], paper: [248, 247, 242] },
  dark: { ink: [230, 228, 220], accent: [224, 87, 79], paper: [15, 26, 42] },
}

// Put each label on the side away from its airport's legs, so it never sits on a line.
const labelOnLeft = new Set(
  airports
    .filter((a) => {
      const eastward = legs.reduce((sum, l) => {
        if (l.from === a) return sum + (l.to.lon - a.lon)
        if (l.to === a) return sum + (l.from.lon - a.lon)
        return sum
      }, 0)
      return eastward > 0
    })
    .map((a) => a.ident),
)

// TextLayer rasterizes glyphs once, so wait for the webfont before drawing labels.
function useFontLoaded(font: string) {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    document.fonts.load(font).then(() => setLoaded(true))
  }, [font])
  return loaded
}

type Props = {
  viewState: MapViewState
  onViewStateChange: (v: MapViewState) => void
}

export function FlightMap({ viewState, onViewStateChange }: Props) {
  const scheme = useColorScheme()
  const { ink, accent, paper } = COLORS[scheme]
  const fontLoaded = useFontLoaded('500 12px "IBM Plex Mono"')

  const layers = [
    new LineLayer<(typeof legs)[number]>({
      id: 'legs',
      data: legs,
      getSourcePosition: (d) => [d.from.lon, d.from.lat],
      getTargetPosition: (d) => [d.to.lon, d.to.lat],
      getColor: accent,
      getWidth: 2.5,
      widthUnits: 'pixels',
    }),
    new ScatterplotLayer<Airport>({
      id: 'airports',
      data: airports,
      getPosition: (d) => [d.lon, d.lat],
      getRadius: 5,
      radiusUnits: 'pixels',
      stroked: true,
      lineWidthUnits: 'pixels',
      getLineWidth: 2,
      getLineColor: ink,
      // Hollow marker: local flights only.
      getFillColor: (d) => (d.localOnly ? paper : ink),
      pickable: true,
      updateTriggers: { getFillColor: scheme },
    }),
    fontLoaded &&
      new TextLayer<Airport>({
        id: 'airport-labels',
        data: airports,
        getPosition: (d) => [d.lon, d.lat],
        getText: (d) => d.ident,
        getSize: 12,
        getColor: ink,
        getPixelOffset: (d) => [labelOnLeft.has(d.ident) ? -10 : 10, 0],
        getTextAnchor: (d) => (labelOnLeft.has(d.ident) ? 'end' : 'start'),
        getAlignmentBaseline: 'center',
        fontFamily: '"IBM Plex Mono", monospace',
        fontWeight: 500,
        outlineWidth: 4,
        outlineColor: paper,
        fontSettings: { sdf: true },
      }),
  ]

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState }) => onViewStateChange(viewState as MapViewState)}
      controller
      layers={layers}
      getTooltip={({ object }) =>
        object && {
          text: `${object.ident}  ${object.name}\n${object.city}, ${object.state} · ${Math.round(object.elevFt)} ft MSL`,
          style: {
            font: '12px/1.5 "IBM Plex Mono", monospace',
            whiteSpace: 'pre',
            color: `rgb(${ink.join(',')})`,
            background: `rgb(${paper.join(',')})`,
            border: '1px solid var(--rule)',
            borderRadius: '2px',
            padding: '6px 8px',
          },
        }
      }
    >
      <Map mapStyle={STYLES[scheme]} />
    </DeckGL>
  )
}

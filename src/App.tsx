import type { MapViewState } from '@deck.gl/core'
import { useState } from 'react'
import { AirportList } from './AirportList'
import { flyTo, initialView } from './map/camera'
import { FlightMap } from './map/FlightMap'

export default function App() {
  const [viewState, setViewState] = useState<MapViewState>(initialView)
  return (
    <>
      <FlightMap viewState={viewState} onViewStateChange={setViewState} />
      <AirportList
        onSelect={(a) => setViewState(flyTo(a))}
        onShowAll={() => setViewState(initialView({ animate: true }))}
      />
    </>
  )
}

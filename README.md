# flight-map

Interactive map of the flights I've flown as a private pilot. Served at flights.gabrielortiz.io.

Vite + React + TypeScript, MapLibre GL (OpenFreeMap tiles) with deck.gl layers on top. No backend; flight data is static and generated from my logbook export.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check + production build into dist/
```

## Data privacy

The raw logbook CSV lives in `logbook/` (git-ignored, along with all `*.csv`). The converter publishes only date, aircraft, route and times; remarks never leave this machine.

## Dependencies

- `.npmrc` sets `ignore-scripts=true`, so no package runs code at install time. Check `npm audit` and `npm audit signatures` after adding anything.
- `@loaders.gl/*` is overridden to 4.5.3 in `package.json`: the 4.5.4 release references an unpublished `@loaders.gl/worker-utils@4.5.4`. Drop the override once that is fixed upstream.
- deck.gl is the root component (`@deck.gl/react`) with MapLibre rendered underneath, rather than `@deck.gl/mapbox`'s overlay: deck.gl 9.4's overlay reads `map.transform`, which MapLibre 6 removed, and MapLibre 5 has a critical XSS advisory (GHSA-jrc7-96c5-q579).

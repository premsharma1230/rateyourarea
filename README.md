# RateYourArea — free data sources (no API key required)

## Already integrated

| Source | Used for | Cost |
|--------|----------|------|
| **Manual seed** | Sectors, societies (`src/data/`) | Free |
| **OpenStreetMap Nominatim** | Area search in review form | Free |
| **Leaflet + OSM tiles** | Area detail map | Free |
| **User-added areas** | Missing societies/PG | Free |

## Optional: RERA Haryana (manual import)

RERA has **no public API**. To add registered projects:

1. Go to [haryanarera.gov.in](https://haryanarera.gov.in/assistancecontrol/project_search_public/1)
2. District: **GURUGRAM** → Search
3. Export/copy project names + addresses
4. Add to `src/data/gurugram-societies.js` under `KNOWN_SOCIETIES_BY_SECTOR`

Future: one-time CSV import script can merge RERA exports into seed data.

## Dev

```bash
npm install
npm run dev
```

No `.env` required for maps or geocoding.

# RateYourArea

Anonymous society and area reviews for Gurugram.

## Google Places (area search)

1. Create a key in [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Enable **Places API** (and **Places API (New)** if prompted)
3. Copy `.env.example` to `.env.local` and set:

```bash
GOOGLE_MAPS_API_KEY=your_key_here
```

4. On Vercel: **Project → Settings → Environment Variables** → add `GOOGLE_MAPS_API_KEY`

The review form's area picker merges:
- local seed + community-added areas
- Google Maps autocomplete (Gurugram-biased)
- manual "Add as new area" fallback

Without an API key, local search and manual add still work.

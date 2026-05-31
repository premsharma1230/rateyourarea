import {
  GURUGRAM_VIEWBOX,
  buildNominatimQuery,
  mapNominatimResult,
} from "@/lib/osm-geocoding";

const USER_AGENT = "RateYourArea/1.0 (https://rateyourarea.vercel.app)";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input")?.trim();

  if (!input || input.length < 2) {
    return Response.json({ predictions: [] });
  }

  const params = new URLSearchParams({
    q: buildNominatimQuery(input),
    format: "json",
    addressdetails: "1",
    limit: "6",
    countrycodes: "in",
    viewbox: GURUGRAM_VIEWBOX,
    bounded: "1",
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) {
      return Response.json({ predictions: [], error: "nominatim_error" }, { status: 502 });
    }

    const results = await response.json();

    return Response.json({
      predictions: (results || []).map(mapNominatimResult),
      source: "openstreetmap",
    });
  } catch {
    return Response.json({ predictions: [], error: "fetch_failed" }, { status: 502 });
  }
}

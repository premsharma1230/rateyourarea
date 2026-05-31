import { parseSectorFromName } from "@/lib/client-db";

const USER_AGENT = "RateYourArea/1.0 (https://rateyourarea.vercel.app)";

function parseSectorFromAddress(address = {}) {
  const parts = [
    address.suburb,
    address.neighbourhood,
    address.quarter,
    address.city_district,
    address.road,
  ].filter(Boolean);

  for (const part of parts) {
    const sector = parseSectorFromName(part);
    if (sector) return sector;
  }
  return null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId")?.trim();
  const query = searchParams.get("q")?.trim();

  if (!placeId && !query) {
    return Response.json({ error: "missing_params" }, { status: 400 });
  }

  try {
    let result = null;

    if (placeId?.includes(":")) {
      const [osmType, osmId] = placeId.split(":");
      const osmParam =
        osmType === "relation"
          ? `R${osmId}`
          : osmType === "way"
            ? `W${osmId}`
            : `N${osmId}`;

      const lookupRes = await fetch(
        `https://nominatim.openstreetmap.org/lookup?osm_ids=${osmParam}&format=json&addressdetails=1`,
        {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
          next: { revalidate: 86400 },
        }
      );
      const lookupData = await lookupRes.json();
      result = lookupData?.[0] || null;
    }

    if (!result && query) {
      const searchRes = await fetch(
        `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "1",
          limit: "1",
          countrycodes: "in",
        }).toString()}`,
        {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
          next: { revalidate: 86400 },
        }
      );
      const searchData = await searchRes.json();
      result = searchData?.[0] || null;
    }

    if (!result) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    return Response.json({
      placeId,
      name: result.name || result.display_name.split(",")[0],
      formattedAddress: result.display_name,
      sector: parseSectorFromAddress(result.address),
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      source: "openstreetmap",
    });
  } catch {
    return Response.json({ error: "fetch_failed" }, { status: 502 });
  }
}

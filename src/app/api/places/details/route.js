import { parseSectorFromAddressComponents } from "@/lib/google-places";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId")?.trim();

  if (!placeId) {
    return Response.json({ error: "missing_place_id" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "missing_api_key" }, { status: 503 });
  }

  const params = new URLSearchParams({
    place_id: placeId,
    key: apiKey,
    fields: "geometry,formatted_address,address_components,types,name",
    language: "en",
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
      { next: { revalidate: 0 } }
    );
    const data = await response.json();

    if (data.status !== "OK" || !data.result) {
      return Response.json(
        { error: data.status, message: data.error_message },
        { status: 502 }
      );
    }

    const result = data.result;

    return Response.json({
      placeId,
      name: result.name,
      formattedAddress: result.formatted_address,
      addressComponents: result.address_components || [],
      types: result.types || [],
      lat: result.geometry?.location?.lat ?? null,
      lng: result.geometry?.location?.lng ?? null,
      sector: parseSectorFromAddressComponents(result.address_components || []),
    });
  } catch {
    return Response.json({ error: "fetch_failed" }, { status: 502 });
  }
}

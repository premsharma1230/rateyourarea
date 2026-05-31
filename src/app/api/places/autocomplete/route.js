import { GURUGRAM_CENTER, mapGooglePrediction } from "@/lib/google-places";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input")?.trim();

  if (!input || input.length < 2) {
    return Response.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Response.json({ predictions: [], error: "missing_api_key" }, { status: 503 });
  }

  const params = new URLSearchParams({
    input,
    key: apiKey,
    components: "country:in",
    location: `${GURUGRAM_CENTER.lat},${GURUGRAM_CENTER.lng}`,
    radius: "35000",
    language: "en",
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`,
      { next: { revalidate: 0 } }
    );
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return Response.json(
        { predictions: [], error: data.status, message: data.error_message },
        { status: 502 }
      );
    }

    return Response.json({
      predictions: (data.predictions || []).slice(0, 6).map(mapGooglePrediction),
    });
  } catch {
    return Response.json({ predictions: [], error: "fetch_failed" }, { status: 502 });
  }
}

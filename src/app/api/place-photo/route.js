import { resolvePlacePhoto } from "@/lib/place-photo-server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const name = searchParams.get("name")?.trim();
  if (!name) {
    return Response.json({ error: "missing_name" }, { status: 400 });
  }

  try {
    const result = await resolvePlacePhoto({
      slug: searchParams.get("slug")?.trim() || null,
      name,
      city: searchParams.get("city")?.trim() || "Gurugram",
      sector: searchParams.get("sector")?.trim() || null,
      address: searchParams.get("address")?.trim() || null,
      image: searchParams.get("image")?.trim() || null,
      lat: searchParams.get("lat"),
      lng: searchParams.get("lng"),
    });

    return Response.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json({ error: "resolve_failed" }, { status: 500 });
  }
}

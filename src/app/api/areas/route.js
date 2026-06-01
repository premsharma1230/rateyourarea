import { getAreaListings } from "@/backend/api/areas";

export async function GET() {
  const result = await getAreaListings();

  if (result.error) {
    return Response.json({ error: result.error.message }, { status: 500 });
  }

  return Response.json({
    data: result.data,
    count: result.count,
    sources: result.sources,
    warning: result.warning ?? undefined,
  });
}

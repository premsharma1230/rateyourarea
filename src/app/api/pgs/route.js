import { getPGListings } from "@/backend/api/pgs";

export async function GET() {
  const result = await getPGListings();

  if (result.error) {
    return Response.json({ error: result.error.message }, { status: 500 });
  }

  return Response.json({
    data: result.data ?? [],
    count: result.count ?? 0,
    sources: result.sources ?? {},
    warning: result.warning ?? null,
  });
}

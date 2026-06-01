import { supabase } from "@/backend/lib/supabase";
import { mapDbAreaToClient } from "@/backend/lib/map-supabase-area";
import { fetchAllRows } from "@/backend/lib/supabase-fetch-all";

/** Societies, sectors, localities — `areas` table only (not `pg_data`) */
export async function getAreaListings() {
  const { data, error } = await fetchAllRows((from, to) =>
    supabase
      .from("areas")
      .select("*")
      .neq("type", "pg")
      .order("name", { ascending: true })
      .range(from, to)
  );

  if (error) {
    return { data: [], count: 0, sources: { areas: 0 }, error };
  }

  const mapped = (data ?? []).map((row) => mapDbAreaToClient(row));
  const sorted = [...mapped].sort(
    (a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0)
  );

  return {
    data: sorted,
    count: sorted.length,
    sources: { areas: sorted.length },
    warning:
      sorted.length === 0
        ? "areas table is empty or not readable. Run backend/supabase/migrations/enable_areas_read.sql in Supabase SQL Editor."
        : null,
    error: null,
  };
}

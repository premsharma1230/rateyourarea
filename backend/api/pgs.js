import { slugify } from "@/lib/client-db";
import { supabase } from "@/backend/lib/supabase";
import { getSupabaseAdmin } from "@/backend/lib/supabase-admin";
import { mapDbAreaToClient } from "@/backend/lib/map-supabase-area";
import { fetchAllRows } from "@/backend/lib/supabase-fetch-all";

function getPgDataClient() {
  return getSupabaseAdmin() ?? supabase;
}

function cleanSector(value) {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  if (!s || s.toUpperCase() === "EMPTY") return null;
  return s;
}

function pickPgName(row) {
  for (const key of ["name", "Name", "title", "pg_name", "place_name"]) {
    const value = row[key];
    if (value != null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return null;
}

function mapPgDataRow(row) {
  const name = pickPgName(row);
  if (!name) return null;

  const slug = (row.slug || row.Slug || slugify(name)).trim();

  const baseSlug = slug || slugify(name);

  return mapDbAreaToClient({
    id: row.id,
    name,
    slug: baseSlug,
    city: row.city || "Gurugram",
    sector: cleanSector(row.sector),
    type: "pg",
    description: row.description || row.top_review,
    image_url: row.image_url,
    lat: row.lat,
    lng: row.lng,
    address: row.address,
    rating_google: row.rating ?? row.rating_google,
    reviews_google: row.reviews_count ?? row.reviews_google,
    maps_url: row.maps_url,
    hours: row.hours,
  });
}

async function fetchPGsFromPgDataTable() {
  const client = getPgDataClient();
  const { data, error } = await fetchAllRows((from, to) =>
    client.from("pg_data").select("*").range(from, to)
  );

  if (error) {
    if (error.code === "PGRST205") {
      return { data: [], error: null, emptyReason: "missing_table" };
    }
    return { data: [], error, emptyReason: "query_error" };
  }

  const mapped = data.map(mapPgDataRow).filter(Boolean);
  const skipped = (data?.length ?? 0) - mapped.length;

  return {
    data: mapped,
    error: null,
    emptyReason:
      (data?.length ?? 0) === 0
        ? "no_rows"
        : mapped.length === 0
          ? "missing_name_column"
          : null,
    skippedRows: skipped > 0 ? skipped : undefined,
  };
}

/** Duplicate slugs break React keys + /area/[slug] links */
function withUniqueSlugs(items) {
  const used = new Set();

  return items.map((item, index) => {
    let slug = (item.slug || slugify(item.name) || `pg-${index + 1}`).trim();
    const base = slug;
    let suffix = 2;

    while (used.has(slug)) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    used.add(slug);
    return slug === item.slug ? item : { ...item, slug };
  });
}

/** PG listings — only `pg_data` table (not `areas`) */
export async function getPGListings() {
  const client = getPgDataClient();
  const { count: rawRowCount } = await client
    .from("pg_data")
    .select("*", { count: "exact", head: true });

  const fromPgData = await fetchPGsFromPgDataTable();

  if (fromPgData.error && fromPgData.error.code !== "PGRST205") {
    return { data: [], count: 0, sources: { pg_data: 0 }, error: fromPgData.error };
  }

  const pgDataCount = fromPgData.data?.length ?? 0;
  const sorted = withUniqueSlugs(
    [...(fromPgData.data ?? [])].sort(
      (a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0)
    )
  );

  let warning = null;
  if (fromPgData.error) {
    warning =
      "pg_data read error. Run recreate_pg_data_table.sql + enable_pg_data_read.sql in Supabase.";
  } else if (fromPgData.emptyReason === "no_rows") {
    warning =
      rawRowCount === 0
        ? "RLS block: Supabase SQL Editor mein fix_pg_data_rls_now.sql chalao (Table Editor → Add RLS policy → read for all)."
        : "pg_data table is empty — CSV dubara import karo.";
  } else if (fromPgData.emptyReason === "missing_name_column") {
    warning =
      "pg_data rows hain par `name` column empty/galat hai. CSV mein name column check karo.";
  } else if (fromPgData.skippedRows) {
    warning = `${fromPgData.skippedRows} rows skip (name missing).`;
  }

  return {
    data: sorted,
    count: sorted.length,
    sources: { pg_data: pgDataCount, raw_rows: rawRowCount ?? 0 },
    warning,
    error: fromPgData.error ?? null,
  };
}

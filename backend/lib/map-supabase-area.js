import { pickImageForType } from "@/lib/entity-images";

const DEFAULT_RATINGS = {
  water: 4,
  power: 4,
  security: 4,
  maintenance: 4,
  internet: 4,
  parking: 3.5,
  schools: 4,
  builderTrust: 4,
};

/** Map Supabase `areas` row → client area card shape */
export function mapDbAreaToClient(row) {
  const rating = Number(row.rating_google ?? row.rating ?? 0);
  const totalReviews =
    parseInt(row.reviews_google ?? row.reviews_count ?? 0, 10) || 0;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    city: row.city ?? "Gurugram",
    sector: row.sector ?? null,
    type: row.type ?? "locality",
    overallRating: rating > 0 ? rating : 4,
    totalReviews,
    ratings: { ...DEFAULT_RATINGS },
    reraComplaints: 0,
    description:
      row.description?.trim() ||
      row.address?.trim() ||
      `${row.name} in ${row.city ?? "Gurugram"}`,
    image:
      row.image_url?.trim() ||
      pickImageForType(row.type ?? "locality", row.slug || row.name),
    address: row.address?.trim() || null,
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    mapsUrl: row.maps_url?.trim() || null,
    tags: row.type ? [row.type] : [],
    pros: [],
    cons: [],
    fromSupabase: true,
  };
}

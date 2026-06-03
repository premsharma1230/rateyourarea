import { supabase } from "@/lib/supabase";

const RESIDENT_LABELS = {
  owner: "Owner",
  tenant: "Tenant",
  former: "Former Resident",
  current_tenant: "Tenant",
  past_tenant: "Former Resident",
  past_owner: "Former Owner",
};

const DURATION_LABELS = {
  "less-1": "Less than 1 year",
  "1-2": "1–2 years",
  "2-5": "2–5 years",
  "5+": "5+ years",
};

function mapFormResidentType(residentType) {
  const map = {
    owner: "owner",
    tenant: "current_tenant",
    former: "past_tenant",
  };
  return map[residentType] || residentType;
}

function buildReviewInsert(reviewData, { userId = null, isAnonymous = true } = {}) {
  return {
    area_id: reviewData.areaId || null,
    area_slug: reviewData.areaSlug,
    user_id: userId,
    is_anonymous: isAnonymous,
    resident_type: mapFormResidentType(reviewData.residentType),
    resident_since: reviewData.residentSince || null,
    duration: reviewData.duration,
    rating_overall: reviewData.ratings.overall,
    rating_water: reviewData.ratings.water || null,
    rating_power: reviewData.ratings.power || null,
    rating_security: reviewData.ratings.security || null,
    rating_maintenance: reviewData.ratings.maintenance || null,
    rating_internet: reviewData.ratings.internet || null,
    rating_parking: reviewData.ratings.parking || null,
    rating_schools: reviewData.ratings.schools || null,
    rating_builder_trust: reviewData.ratings.builderTrust || null,
    pros: reviewData.pros || null,
    cons: reviewData.cons || null,
    tags: reviewData.tags || [],
    recommended: reviewData.recommended ?? true,
    photo_url: reviewData.photoUrl?.trim() || null,
  };
}

export function mapDbReviewToClient(row, areaName = null) {
  if (!row) return null;

  const rating = row.rating_overall ?? 0;
  const quote =
    [row.pros, row.cons].filter(Boolean).join(" ").trim() ||
    "Shared an experience about this area.";

  const tags = (row.tags || []).map((label) => ({
    label,
    icon: "alert-triangle",
    variant: "error",
  }));

  if (row.recommended === true) {
    tags.push({ label: "Recommended", icon: "star", variant: "primary" });
  } else if (row.recommended === false) {
    tags.push({
      label: "Not recommended",
      icon: "alert-triangle",
      variant: "error",
    });
  }

  return {
    id: row.id,
    areaSlug: row.area_slug,
    areaName: areaName || row.area_slug,
    rating,
    detailedRatings: {
      overall: row.rating_overall,
      water: row.rating_water,
      power: row.rating_power,
      security: row.rating_security,
      maintenance: row.rating_maintenance,
      internet: row.rating_internet,
      parking: row.rating_parking,
      schools: row.rating_schools,
      builderTrust: row.rating_builder_trust,
    },
    residentType: row.resident_type,
    residentLabel: RESIDENT_LABELS[row.resident_type] || "Resident",
    duration: DURATION_LABELS[row.duration] || row.duration,
    pincode: row.pincode,
    quote,
    pros: row.pros,
    cons: row.cons,
    issues: row.tags || [],
    tags,
    recommended: row.recommended,
    date: row.created_at
      ? new Date(row.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    avatarVariant: rating <= 2.5 ? "error" : "primary",
    isUserReview: !row.is_anonymous,
    isAnonymous: row.is_anonymous,
    photoUrl: row.photo_url || null,
  };
}

export async function submitAnonymousReview(reviewData) {
  const { data, error } = await supabase
    .from("reviews")
    .insert([buildReviewInsert(reviewData, { isAnonymous: true })])
    .select();

  return { data, error };
}

export async function submitUserReview(reviewData, userId) {
  const { data, error } = await supabase
    .from("reviews")
    .insert([
      buildReviewInsert(reviewData, {
        userId,
        isAnonymous: false,
      }),
    ])
    .select();

  return { data, error };
}

export async function getAreaReviews(areaSlug, sortBy = "newest") {
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("area_slug", areaSlug)
    .eq("status", "published");

  if (sortBy === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (sortBy === "highest") {
    query = query.order("rating_overall", { ascending: false });
  } else if (sortBy === "lowest") {
    query = query.order("rating_overall", { ascending: true });
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getAreaStats(areaSlug) {
  const { data, error } = await supabase
    .from("area_stats")
    .select("*")
    .eq("area_slug", areaSlug)
    .single();

  return { data, error };
}

export async function getAllAreas() {
  const { data, error } = await supabase
    .from("areas")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function fetchPublishedReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return { data, error };
}

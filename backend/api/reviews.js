import { supabase } from "@/backend/lib/supabase";
import { normalizeReviewTargetType } from "@/lib/review-target";

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

function toOptionalRating(value) {
  const rating = Number(value);
  return rating >= 1 && rating <= 5 ? rating : null;
}

function isMissingColumnError(error) {
  const message = error?.message?.toLowerCase() || "";
  const code = error?.code || "";
  return (
    code === "PGRST204" ||
    message.includes("column") ||
    message.includes("schema cache")
  );
}

function buildReviewInsert(
  reviewData,
  {
    userId = null,
    isAnonymous = true,
    reviewerDisplayName = null,
    includeExtended = true,
    includeReviewerName = true,
  } = {}
) {
  const row = {
    area_id: reviewData.areaId || null,
    area_slug: reviewData.areaSlug,
    user_id: userId,
    is_anonymous: isAnonymous,
    resident_type: mapFormResidentType(reviewData.residentType),
    resident_since: reviewData.residentSince || null,
    duration: reviewData.duration,
    rating_overall: reviewData.ratings.overall,
    rating_water: toOptionalRating(reviewData.ratings.water),
    rating_power: toOptionalRating(reviewData.ratings.power),
    rating_security: toOptionalRating(reviewData.ratings.security),
    rating_maintenance: toOptionalRating(reviewData.ratings.maintenance),
    rating_internet: toOptionalRating(reviewData.ratings.internet),
    rating_parking: toOptionalRating(reviewData.ratings.parking),
    rating_schools: toOptionalRating(reviewData.ratings.schools),
    rating_builder_trust: toOptionalRating(reviewData.ratings.builderTrust),
    pros: reviewData.pros?.trim() || null,
    cons: reviewData.cons?.trim() || null,
    tags: reviewData.tags || [],
    recommended: reviewData.recommended ?? true,
  };

  if (includeExtended) {
    if (reviewData.reviewTargetType) {
      row.review_target_type = normalizeReviewTargetType(
        reviewData.reviewTargetType
      );
    }
    const targetName = reviewData.reviewTargetName?.trim();
    if (targetName) {
      row.review_target_name = targetName;
    }
  }

  if (includeReviewerName && reviewerDisplayName?.trim()) {
    row.reviewer_display_name = reviewerDisplayName.trim();
  }

  return row;
}

async function insertReview(reviewData, options) {
  return supabase
    .from("reviews")
    .insert([buildReviewInsert(reviewData, options)])
    .select();
}

async function submitReviewInsert(reviewData, options) {
  let { data, error } = await insertReview(reviewData, {
    ...options,
    includeExtended: true,
    includeReviewerName: true,
  });

  if (error && isMissingColumnError(error)) {
    ({ data, error } = await insertReview(reviewData, {
      ...options,
      includeExtended: false,
      includeReviewerName: true,
    }));
  }

  if (error && isMissingColumnError(error)) {
    ({ data, error } = await insertReview(reviewData, {
      ...options,
      includeExtended: false,
      includeReviewerName: false,
    }));
  }

  return { data, error };
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
    reviewTargetType: row.review_target_type || null,
    reviewTargetName: row.review_target_name || null,
    tags,
    recommended: row.recommended,
    date: row.created_at
      ? new Date(row.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    avatarVariant: rating <= 2.5 ? "error" : "primary",
    isUserReview: row.is_anonymous === false,
    isAnonymous: row.is_anonymous !== false,
    reviewerDisplayName: row.reviewer_display_name || null,
    userId: row.user_id || null,
  };
}

export async function submitAnonymousReview(reviewData) {
  return submitReviewInsert(reviewData, { isAnonymous: true });
}

export async function submitUserReview(
  reviewData,
  userId,
  reviewerDisplayName = null
) {
  return submitReviewInsert(reviewData, {
    userId,
    isAnonymous: false,
    reviewerDisplayName,
  });
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

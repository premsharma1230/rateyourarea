const REVIEWS_KEY = "rateyourarea_reviews";
const AREAS_KEY = "rateyourarea_custom_areas";

import { pickImageForType } from "@/lib/entity-images";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80";

export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseSectorFromName(name) {
  const match = name.match(/sector\s*(\d+)/i);
  return match ? match[1] : null;
}

export function createCustomArea({
  name,
  type,
  sector = null,
  city = "Gurugram",
  googlePlaceId = null,
  osmPlaceId = null,
  address = null,
  lat = null,
  lng = null,
  image = null,
}) {
  const baseSlug = slugify(name);
  const existing = getCustomAreas();
  let slug = baseSlug;
  let counter = 1;

  while (existing.some((a) => a.slug === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const parsedSector = sector || parseSectorFromName(name);

  return {
    slug,
    name: name.trim(),
    city,
    sector:
      type === "sector"
        ? parsedSector || slugify(name).replace("sector-", "")
        : parsedSector,
    type,
    overallRating: 0,
    totalReviews: 0,
    ratings: {
      water: 0,
      power: 0,
      security: 0,
      maintenance: 0,
      internet: 0,
      parking: 0,
      schools: 0,
      builderTrust: 0,
    },
    reraComplaints: 0,
    description:
      osmPlaceId || googlePlaceId
        ? `Listed via OpenStreetMap in ${city}.`
        : `Community-added ${type} in ${city}.`,
    image: image?.trim() || pickImageForType(type, slug),
    tags:
      osmPlaceId || googlePlaceId
        ? ["OpenStreetMap", "Community added"]
        : ["Community added"],
    pros: [],
    cons: [],
    isCustom: true,
    googlePlaceId,
    osmPlaceId,
    address,
    lat,
    lng,
    createdAt: new Date().toISOString(),
  };
}

export function getCustomAreas() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AREAS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomArea(area) {
  const existing = getCustomAreas();
  if (existing.some((a) => a.slug === area.slug)) return area;
  localStorage.setItem(AREAS_KEY, JSON.stringify([...existing, area]));
  return area;
}

export function getStoredReviews() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReview(review) {
  const existing = getStoredReviews();
  localStorage.setItem(REVIEWS_KEY, JSON.stringify([review, ...existing]));
  return review;
}

const ISSUE_TAG_MAP = {
  Pests: { label: "Pests", icon: "bug", variant: "error" },
  "Water supply issues": { label: "Water issues", icon: "droplets", variant: "error" },
  "Power cuts": { label: "Power cuts", icon: "zap", variant: "error" },
  "Security concerns": { label: "Security", icon: "shield", variant: "error" },
  "Parking problems": { label: "Parking", icon: "car", variant: "error" },
  "Noise pollution": { label: "Noise", icon: "volume-2", variant: "error" },
  "Maintenance delays": { label: "Maintenance", icon: "wrench", variant: "error" },
};

const RESIDENT_LABELS = {
  owner: "Owner",
  tenant: "Tenant",
  former: "Former Resident",
};

const DURATION_LABELS = {
  "less-1": "Less than 1 year",
  "1-2": "1–2 years",
  "2-5": "2–5 years",
  "5+": "5+ years",
};

export function buildReviewFromForm(
  form,
  area,
  { isAnonymous = true, reviewerDisplayName = null } = {}
) {
  const rating = form.ratings.overall || 0;
  const reviewBody = form.reviewText?.trim() || "";
  const quote =
    reviewBody || "Shared an experience about this area.";

  const tags = (form.issues || [])
    .map((issue) => ISSUE_TAG_MAP[issue])
    .filter(Boolean);

  if (form.recommend === true) {
    tags.push({ label: "Recommended", icon: "star", variant: "primary" });
  } else if (form.recommend === false) {
    tags.push({ label: "Not recommended", icon: "alert-triangle", variant: "error" });
  }

  return {
    id: `user-${Date.now()}`,
    areaSlug: area.slug,
    areaName: area.name,
    areaType: area.type,
    reviewTargetType: form.reviewTargetType || null,
    reviewTargetName: form.reviewTargetName?.trim() || null,
    rating,
    detailedRatings: form.ratings,
    residentType: form.residentType,
    residentLabel: RESIDENT_LABELS[form.residentType] || "Resident",
    duration: DURATION_LABELS[form.duration] || form.duration,
    pincode: form.pincode,
    quote,
    pros: reviewBody,
    cons: "",
    issues: form.issues,
    tags,
    recommended: form.recommend,
    date: new Date().toISOString().split("T")[0],
    avatarVariant: rating <= 2.5 ? "error" : "primary",
    isUserReview: !isAnonymous,
    isAnonymous,
    reviewerDisplayName: reviewerDisplayName?.trim() || null,
    photoUrl: form.photoUrl?.trim() || null,
  };
}

export { RESIDENT_LABELS, DURATION_LABELS };

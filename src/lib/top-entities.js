import { slugify } from "@/lib/client-db";
import { normalizeReviewTargetType } from "@/lib/review-target";

export const TOP_SECTIONS = [
  {
    id: "society",
    title: "Top Society",
    subtitle: "Highest-rated societies in Gurugram",
    types: ["society"],
    fromAreas: true,
    viewAllHref: "/explore?type=society",
  },
  {
    id: "area",
    title: "Trending Area",
    subtitle: "Top localities in Gurugram",
    types: ["locality"],
    fromAreas: true,
    viewAllHref: "/explore?type=locality",
  },
  {
    id: "pg",
    title: "Top PG and Flat",
    subtitle: "Highest-rated PGs in Gurugram",
    types: ["pg"],
    fromAreas: true,
    viewAllHref: "/explore?type=pg",
  },
  {
    id: "sector",
    title: "Top Sectors",
    subtitle: "Sectors in Gurugram",
    types: ["sector"],
    fromAreas: true,
    viewAllHref: "/explore?type=sector",
  },
];

const TYPE_ICONS = {
  society: "building",
  sector: "grid",
  pg: "bed",
  flat: "home",
  locality: "map-pin",
};

function normalizeName(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}

function buildEntityKey(type, name, areaSlug) {
  return `${normalizeReviewTargetType(type)}::${normalizeName(name)}::${areaSlug || ""}`;
}

function getReviewEntity(review, areasBySlug) {
  const targetName = review.reviewTargetName?.trim();
  const targetType = review.reviewTargetType
    ? normalizeReviewTargetType(review.reviewTargetType)
    : null;

  if (targetName && targetType) {
    return {
      type: targetType,
      name: targetName,
      areaSlug: review.areaSlug,
      key: buildEntityKey(targetType, targetName, review.areaSlug),
    };
  }

  const area = areasBySlug.get(review.areaSlug);
  if (!area) return null;

  return {
    type: normalizeReviewTargetType(area.type),
    name: area.name,
    areaSlug: review.areaSlug,
    key: buildEntityKey(area.type, area.name, review.areaSlug),
  };
}

function matchesSection(entityType, sectionTypes) {
  if (!sectionTypes) return true;
  return sectionTypes.includes(entityType);
}

function rankScore(avgRating, count) {
  return avgRating * Math.log10(count + 1);
}

function getAreaOnlyEntity(review, areasBySlug) {
  const area = areasBySlug.get(review.areaSlug);
  if (!area) return null;

  return {
    type: normalizeReviewTargetType(area.type),
    name: area.name,
    areaSlug: review.areaSlug,
    key: `area::${review.areaSlug}`,
  };
}

function buildReviewStatsByAreaSlug(reviews = []) {
  const counts = new Map();
  const ratings = new Map();

  for (const review of reviews) {
    const slug = review.areaSlug;
    if (!slug) continue;

    counts.set(slug, (counts.get(slug) || 0) + 1);

    const bucket = ratings.get(slug) || { sum: 0, count: 0 };
    bucket.sum += Number(review.rating) || 0;
    bucket.count += 1;
    ratings.set(slug, bucket);
  }

  const avgBySlug = new Map();
  for (const [slug, bucket] of ratings) {
    if (bucket.count > 0) {
      avgBySlug.set(slug, bucket.sum / bucket.count);
    }
  }

  return { counts, avgBySlug };
}

/** Top carousel from area listings (Supabase) + community review counts */
export function aggregateTopAreasFromList(
  areas,
  sectionTypes,
  limit = 10,
  reviews = []
) {
  const types = sectionTypes || [];
  const { counts: communityCounts, avgBySlug: communityAvg } =
    buildReviewStatsByAreaSlug(reviews);

  const ranked = areas
    .filter((area) => types.includes(area.type))
    .map((area) => {
      const googleCount = Number(area.totalReviews) || 0;
      const communityCount = communityCounts.get(area.slug) || 0;
      const reviewCount = communityCount > 0 ? communityCount : googleCount;

      let avgRating = Number(area.overallRating) || 0;
      if (communityCount > 0 && communityAvg.has(area.slug)) {
        avgRating = communityAvg.get(area.slug);
      }

      const displayRating = avgRating > 0 ? avgRating : 4;

      return {
        key: `area::${area.slug}`,
        type: area.type,
        name: area.name,
        nameSlug: area.slug,
        areaSlug: area.slug,
        areaName: area.name,
        city: area.city || "Gurugram",
        sector: area.sector || null,
        image: area.image || null,
        address: area.address || null,
        lat: area.lat ?? null,
        lng: area.lng ?? null,
        avgRating: displayRating,
        reviewCount,
        communityReviewCount: communityCount,
        googleReviewCount: googleCount,
        icon: TYPE_ICONS[area.type] || "bed",
        score: rankScore(displayRating, reviewCount),
        href: `/area/${area.slug}`,
      };
    })
    .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount)
    .slice(0, limit);

  return ranked;
}

export function aggregateTopEntities(reviews, areas, sectionTypes, limit = 8) {
  const areasBySlug = new Map(areas.map((a) => [a.slug, a]));
  const buckets = new Map();
  const areaOnlyMode = sectionTypes === null;

  for (const review of reviews) {
    const entity = areaOnlyMode
      ? getAreaOnlyEntity(review, areasBySlug)
      : getReviewEntity(review, areasBySlug);
    if (!entity) continue;

    if (!areaOnlyMode && !matchesSection(entity.type, sectionTypes)) {
      continue;
    }

    const area = areasBySlug.get(entity.areaSlug);
    const bucket = buckets.get(entity.key) || {
      key: entity.key,
      type: entity.type,
      name: entity.name,
      nameSlug: slugify(entity.name),
      areaSlug: entity.areaSlug,
      areaName: area?.name || review.areaName,
      city: area?.city || "Gurugram",
      sector: area?.sector || null,
      image: area?.image || null,
      ratings: [],
      reviewCount: 0,
    };

    bucket.ratings.push(review.rating);
    bucket.reviewCount += 1;
    buckets.set(entity.key, bucket);
  }

  const ranked = [...buckets.values()]
    .filter((b) => b.reviewCount > 0)
    .map((b) => {
      const avgRating =
        b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length;
      return {
        ...b,
        avgRating,
        icon: TYPE_ICONS[b.type] || "building",
        score: rankScore(avgRating, b.reviewCount),
        href: areaOnlyMode ? `/area/${b.areaSlug}` : buildEntityHref(b),
      };
    })
    .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount)
    .slice(0, limit);

  return ranked;
}

export function buildEntitySubtitle(entity) {
  const parts = [];
  if (entity.sector) {
    parts.push(`Sector ${entity.sector}`);
  } else if (entity.areaName && entity.areaName !== entity.name) {
    parts.push(entity.areaName);
  }
  parts.push(entity.city || "Gurugram");
  return parts.filter(Boolean).join(", ");
}

export function buildEntityHref(entity) {
  const params = new URLSearchParams();
  if (entity.areaSlug) params.set("area", entity.areaSlug);
  const query = params.toString();
  return `/entity/${entity.type}/${entity.nameSlug}${query ? `?${query}` : ""}`;
}

export function reviewMatchesEntity(review, type, nameSlug, areaSlug, areasBySlug) {
  const normalizedType = normalizeReviewTargetType(type);
  const targetName = review.reviewTargetName?.trim();

  if (targetName) {
    const reviewType = normalizeReviewTargetType(review.reviewTargetType);
    const nameMatch = slugify(targetName) === nameSlug;
    const typeMatch = reviewType === normalizedType;
    const areaMatch = !areaSlug || review.areaSlug === areaSlug;
    return typeMatch && nameMatch && areaMatch;
  }

  if (!areaSlug || review.areaSlug !== areaSlug) return false;

  const area = areasBySlug.get(areaSlug);
  if (!area) return false;

  return (
    slugify(area.name) === nameSlug &&
    normalizeReviewTargetType(area.type) === normalizedType
  );
}

export function decodeEntityName(slug) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

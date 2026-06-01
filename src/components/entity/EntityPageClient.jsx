"use client";

import Link from "next/link";
import { Building2, Grid3x3, BedDouble, Home, MapPin, MessageSquarePlus } from "lucide-react";

import EntityReviews from "@/components/entity/EntityReviews";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import RatingBadge from "@/components/shared/RatingBadge";
import { buildExploreBreadcrumbs } from "@/lib/explore-nav";
import {
  decodeEntityName,
  reviewMatchesEntity,
} from "@/lib/top-entities";
import { formatReviewTargetLabel, normalizeReviewTargetType } from "@/lib/review-target";
import styles from "@/app/entity/[type]/[slug]/page.module.scss";

const TYPE_ICONS = {
  society: Building2,
  sector: Grid3x3,
  pg: BedDouble,
  flat: Home,
  locality: MapPin,
};

export default function EntityPageClient({ type, slug, areaSlug }) {
  const { allReviews, allAreas, ready } = useCommunityData();
  const normalizedType = normalizeReviewTargetType(type);
  const displayName = decodeEntityName(slug);
  const areasBySlug = new Map(allAreas.map((a) => [a.slug, a]));
  const parentArea = areaSlug ? areasBySlug.get(areaSlug) : null;

  const reviews = ready
    ? allReviews.filter((r) =>
        reviewMatchesEntity(r, normalizedType, slug, areaSlug, areasBySlug)
      )
    : [];

  if (!ready) {
    return <div className={styles.page} aria-busy="true" />;
  }

  const entityLabel =
    formatReviewTargetLabel(normalizedType, displayName) || displayName;
  const Icon = TYPE_ICONS[normalizedType] || Building2;
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  const subtitleParts = [];
  if (parentArea?.sector) subtitleParts.push(`Sector ${parentArea.sector}`);
  else if (parentArea?.name && parentArea.name !== displayName) {
    subtitleParts.push(parentArea.name);
  }
  subtitleParts.push(parentArea?.city || "Gurugram");

  const reviewHref = parentArea
    ? `/review?area=${parentArea.slug}`
    : "/review";

  const breadcrumbItems = buildExploreBreadcrumbs(normalizedType, displayName);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <Icon className={styles.icon} aria-hidden />
        </div>
        <div className={styles.heroContent}>
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className={styles.title}>{displayName}</h1>
          <p className={styles.subtitle}>{subtitleParts.join(", ")}</p>
          <div className={styles.meta}>
            <RatingBadge rating={avgRating || parentArea?.overallRating || 0} />
            <span className={styles.reviews}>
              {reviewCount} review{reviewCount === 1 ? "" : "s"}
            </span>
          </div>
          <Link href={reviewHref} className={styles.reviewBtn}>
            <MessageSquarePlus className="size-5" aria-hidden />
            Add Your Review
          </Link>
        </div>
      </div>

      <div className={styles.content}>
        <EntityReviews
          reviews={reviews}
          entityName={displayName}
          reviewHref={reviewHref}
        />
      </div>
    </div>
  );
}

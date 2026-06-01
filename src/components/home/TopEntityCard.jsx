"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, Grid3x3, BedDouble, Home, MapPin, Star } from "lucide-react";

import { buildEntityHref, buildEntitySubtitle } from "@/lib/top-entities";
import styles from "./TopEntityCard.module.scss";

const ICON_MAP = {
  building: Building2,
  grid: Grid3x3,
  bed: BedDouble,
  home: Home,
  "map-pin": MapPin,
};

function TopEntityCard({ entity }) {
  const Icon = ICON_MAP[entity.icon] || Building2;
  const href = entity.href || buildEntityHref(entity);
  const location = buildEntitySubtitle(entity);
  const ratingLabel = `${entity.avgRating.toFixed(1)}/5`;
  const communityCount = Number(entity.communityReviewCount) || 0;
  const googleCount =
    Number(entity.googleReviewCount ?? entity.reviewCount) || 0;
  const displayCount = communityCount > 0 ? communityCount : googleCount;

  let reviewLabel = "No reviews yet";
  if (communityCount > 0) {
    reviewLabel = `${communityCount} review${communityCount === 1 ? "" : "s"}`;
  } else if (googleCount > 0) {
    reviewLabel = `${googleCount}+ review${googleCount === 1 ? "" : "s"}`;
  }

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.media}>
        {entity.image ? (
          <Image
            src={entity.image}
            alt={entity.name}
            fill
            className={styles.image}
            sizes="(max-width: 640px) 75vw, 320px"
          />
        ) : (
          <div className={styles.placeholder}>
            <Icon className={styles.typeIcon} aria-hidden />
          </div>
        )}
        <div className={styles.imageFade} aria-hidden />
      </div>

      <div className={styles.infoPanel}>
        <h3 className={styles.name}>{entity.name}</h3>
        <div className={styles.meta}>
          <span className={styles.rating}>
            <Star className={styles.star} aria-hidden />
            {ratingLabel}
          </span>
          {location ? (
            <>
              <span className={styles.dot} aria-hidden />
              <span className={styles.location}>{location}</span>
            </>
          ) : null}
        </div>
        <p className={styles.reviewCount}>{reviewLabel}</p>
      </div>
    </Link>
  );
}

export default memo(TopEntityCard);

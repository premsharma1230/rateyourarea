"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

import { pickImageForType } from "@/lib/entity-images";
import { usePlacePhoto } from "@/hooks/usePlacePhoto";
import { buildEntityHref, buildEntitySubtitle } from "@/lib/top-entities";
import styles from "./TopEntityCard.module.scss";

function TopEntityCard({ entity }) {
  const href = entity.href || buildEntityHref(entity);
  const location = buildEntitySubtitle(entity);
  const { photoUrl, loading } = usePlacePhoto({
    type: entity.type,
    slug: entity.areaSlug || entity.nameSlug,
    name: entity.name,
    city: entity.city,
    sector: entity.sector,
    address: entity.address,
    image: entity.image,
    lat: entity.lat,
    lng: entity.lng,
  });
  const ratingLabel = `${entity.avgRating.toFixed(1)}/5`;
  const communityCount = Number(entity.communityReviewCount) || 0;
  const googleCount =
    Number(entity.googleReviewCount ?? entity.reviewCount) || 0;
  const displayCount = communityCount > 0 ? communityCount : googleCount;

  const fallbackPhoto = useMemo(
    () =>
      pickImageForType(
        entity.type,
        entity.areaSlug || entity.nameSlug || entity.name
      ),
    [entity.type, entity.areaSlug, entity.nameSlug, entity.name]
  );
  const [imgSrc, setImgSrc] = useState(photoUrl);

  useEffect(() => {
    setImgSrc(photoUrl || fallbackPhoto);
  }, [photoUrl, fallbackPhoto]);

  let reviewLabel = "No reviews yet";
  if (communityCount > 0) {
    reviewLabel = `${communityCount} review${communityCount === 1 ? "" : "s"}`;
  } else if (googleCount > 0) {
    reviewLabel = `${googleCount}+ review${googleCount === 1 ? "" : "s"}`;
  }

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.media}>
        <Image
          src={imgSrc || fallbackPhoto}
          alt={entity.name}
          fill
          className={`${styles.image} ${loading ? styles.imageLoading : ""}`}
          sizes="(max-width: 640px) 72vw, (max-width: 1024px) 46vw, 280px"
          onError={() => setImgSrc(fallbackPhoto)}
        />
        <div className={styles.imageFade} aria-hidden />
        <span className={styles.ratingBadge}>
          <Star className={styles.star} aria-hidden />
          {ratingLabel}
        </span>
      </div>

      <div className={styles.infoPanel}>
        <h3 className={styles.name}>{entity.name}</h3>
        {location ? (
          <p className={styles.location}>{location}</p>
        ) : null}
        <p className={styles.reviewCount}>{reviewLabel}</p>
      </div>
    </Link>
  );
}

export default memo(TopEntityCard);

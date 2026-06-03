"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { pickImageForType } from "@/lib/entity-images";
import { usePlacePhoto } from "@/hooks/usePlacePhoto";
import styles from "./AreaCard.module.scss";

function buildAreaSubtitle(area) {
  const parts = [];
  if (area.sector) {
    parts.push(`Sector ${area.sector}`);
  }
  if (area.city) {
    parts.push(area.city);
  }
  return parts.join(", ");
}

function buildReviewLabel(area) {
  const count = Number(area.totalReviews) || 0;
  if (count > 0) {
    return `${count}+ review${count === 1 ? "" : "s"}`;
  }
  return "No reviews yet";
}

export default function AreaCard({ area, index = 0, animateOnMount = false }) {
  const { photoUrl, loading } = usePlacePhoto({
    type: area.type,
    slug: area.slug,
    name: area.name,
    city: area.city,
    sector: area.sector,
    address: area.address,
    image: area.image,
    lat: area.lat,
    lng: area.lng,
  });
  const fallbackPhoto = useMemo(
    () => pickImageForType(area.type, area.slug),
    [area.type, area.slug]
  );
  const [imgSrc, setImgSrc] = useState(photoUrl);

  useEffect(() => {
    setImgSrc(photoUrl || fallbackPhoto);
  }, [photoUrl, fallbackPhoto]);

  const staggerDelay = Math.min(index, 8) * 0.06;
  const location = buildAreaSubtitle(area);
  const ratingLabel = `${Number(area.overallRating || 0).toFixed(1)}/5`;

  return (
    <motion.div
      className={styles.cardWrap}
      initial={{ opacity: 0, y: animateOnMount ? 12 : 20 }}
      {...(animateOnMount
        ? {
            animate: { opacity: 1, y: 0 },
            transition: { delay: staggerDelay, duration: 0.3 },
          }
        : {
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-40px" },
            transition: { delay: staggerDelay, duration: 0.4 },
          })}
    >
      <Link href={`/area/${area.slug}`} className={styles.card}>
        <div className={styles.media}>
          <Image
            src={imgSrc || fallbackPhoto}
            alt={area.name}
            fill
            className={`${styles.image} ${loading ? styles.imageLoading : ""}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            onError={() => setImgSrc(fallbackPhoto)}
          />
          <div className={styles.imageFade} aria-hidden />
          <span className={styles.ratingBadge}>
            <Star className={styles.star} aria-hidden />
            {ratingLabel}
          </span>
        </div>

        <div className={styles.infoPanel}>
          <h3 className={styles.title}>{area.name}</h3>
          {location ? <p className={styles.location}>{location}</p> : null}
          <p className={styles.reviewCount}>{buildReviewLabel(area)}</p>
        </div>
      </Link>
    </motion.div>
  );
}

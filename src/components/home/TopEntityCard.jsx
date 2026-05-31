"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, Grid3x3, BedDouble, Home, MapPin, Star } from "lucide-react";

import RatingBadge from "@/components/shared/RatingBadge";
import { buildEntityHref, buildEntitySubtitle } from "@/lib/top-entities";
import styles from "./TopEntityCard.module.scss";

const ICON_MAP = {
  building: Building2,
  grid: Grid3x3,
  bed: BedDouble,
  home: Home,
  "map-pin": MapPin,
};

export default function TopEntityCard({ entity, index = 0 }) {
  const Icon = ICON_MAP[entity.icon] || Building2;
  const href = entity.href || buildEntityHref(entity);
  const subtitle = buildEntitySubtitle(entity);

  return (
    <motion.div
      className={styles.wrap}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <Link href={href} className={styles.card}>
        <div className={styles.media}>
          {entity.image ? (
            <Image
              src={entity.image}
              alt=""
              fill
              className={styles.image}
              sizes="200px"
            />
          ) : (
            <div className={styles.placeholder}>
              <Icon className={styles.typeIcon} aria-hidden />
            </div>
          )}
        </div>
        <div className={styles.body}>
          <h3 className={styles.name}>{entity.name}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
          <div className={styles.stats}>
            <div className={styles.rating}>
              <Star className={styles.star} aria-hidden />
              <span className={styles.ratingValue}>
                {entity.avgRating.toFixed(1)}
              </span>
              <RatingBadge rating={entity.avgRating} />
            </div>
            <span className={styles.count}>
              {entity.reviewCount} review{entity.reviewCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

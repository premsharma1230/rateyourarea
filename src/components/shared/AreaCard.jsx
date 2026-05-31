"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

import RatingBadge from "./RatingBadge";
import styles from "./AreaCard.module.scss";

export default function AreaCard({ area, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href={`/area/${area.slug}`} className={styles.card}>
        <div className={styles.imageWrap}>
          <div className={styles.overlay} />
          <Image
            src={area.image}
            alt={area.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title}>{area.name}</h3>
            <RatingBadge rating={area.overallRating} />
          </div>
          <p className={styles.description}>{area.description}</p>
          <div className={styles.footer}>
            <span className={styles.reviews}>{area.totalReviews}+ Reviews</span>
            <ChevronRight className={styles.chevron} aria-hidden />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

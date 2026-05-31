"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { areas, trendingSlugs } from "@/data/areas";
import AreaCard from "@/components/shared/AreaCard";
import styles from "./TrendingAreas.module.scss";

export default function TrendingAreas() {
  const trending = trendingSlugs
    .map((slug) => areas.find((a) => a.slug === slug))
    .filter(Boolean);

  return (
    <section className={styles.section}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div>
          <h2 className={styles.title}>Trending Areas</h2>
          <p className={styles.subtitle}>
            Localities with the highest community engagement this week
          </p>
        </div>
        <Link href="/explore" className={styles.viewAll}>
          View all areas
          <ArrowRight className={styles.arrow} aria-hidden />
        </Link>
      </motion.div>
      <div className={styles.grid}>
        {trending.map((area, index) => (
          <AreaCard key={area.slug} area={area} index={index} />
        ))}
      </div>
    </section>
  );
}

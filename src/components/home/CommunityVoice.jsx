"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import ReviewCardsCarousel from "@/components/shared/ReviewCardsCarousel";
import styles from "./CommunityVoice.module.scss";

export default function CommunityVoice() {
  const { allReviews, ready } = useCommunityData();
  const [tab, setTab] = useState("recent");

  const sortedReviews = useMemo(() => {
    if (tab === "highest") {
      return [...allReviews].sort((a, b) => b.rating - a.rating);
    }
    return allReviews;
  }, [allReviews, tab]);

  if (!ready) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Community Voice
        </motion.h2>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === "recent" ? styles.tabActive : ""}`}
            onClick={() => setTab("recent")}
          >
            Most Recent
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === "highest" ? styles.tabActive : ""}`}
            onClick={() => setTab("highest")}
          >
            Highest Rated
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ReviewCardsCarousel
            variant="threeUp"
            reviews={sortedReviews}
            emptyMessage="No reviews yet. Be the first to share your experience."
          />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

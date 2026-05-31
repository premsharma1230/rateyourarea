"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import ReviewCard from "@/components/shared/ReviewCard";
import styles from "./CommunityVoice.module.scss";

export default function CommunityVoice() {
  const { allReviews, ready } = useCommunityData();
  const [tab, setTab] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(4);

  const sortedReviews = useMemo(() => {
    if (tab === "highest") {
      return [...allReviews].sort((a, b) => b.rating - a.rating);
    }
    return allReviews;
  }, [allReviews, tab]);

  const reviews = sortedReviews.slice(0, visibleCount);
  const hasMore = visibleCount < sortedReviews.length;

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
            onClick={() => {
              setTab("recent");
              setVisibleCount(4);
            }}
          >
            Most Recent
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === "highest" ? styles.tabActive : ""}`}
            onClick={() => {
              setTab("highest");
              setVisibleCount(4);
            }}
          >
            Highest Rated
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          className={styles.grid}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} detailed />
          ))}
        </motion.div>
      </AnimatePresence>

      {hasMore && (
        <div className={styles.loadMoreWrap}>
          <button
            type="button"
            className={styles.loadMore}
            onClick={() => setVisibleCount((c) => c + 4)}
          >
            Load More Reviews
            <ChevronDown aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}

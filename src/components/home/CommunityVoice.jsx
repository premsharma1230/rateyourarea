"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { getReviewsByTab } from "@/data/reviews";
import ReviewCard from "@/components/shared/ReviewCard";
import styles from "./CommunityVoice.module.scss";

export default function CommunityVoice() {
  const [tab, setTab] = useState("recent");
  const reviews = getReviewsByTab(tab === "highest" ? "highest" : "recent").slice(
    0,
    2
  );

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
          className={styles.grid}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </motion.div>
      </AnimatePresence>

      <div className={styles.loadMoreWrap}>
        <button type="button" className={styles.loadMore}>
          Load More Reviews
          <ChevronDown aria-hidden />
        </button>
      </div>
    </section>
  );
}

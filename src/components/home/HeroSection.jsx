"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";

import styles from "./HeroSection.module.scss";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.glow1} aria-hidden />
      <div className={styles.glow2} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.content}>
          <motion.div
            className={styles.badge}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span className={styles.pingWrap}>
              <span className={styles.ping} />
              <span className={styles.dot} />
            </span>
            Live Community Insights
          </motion.div>

          <motion.h1
            className={styles.heading}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
          >
            Know your area <br />
            <span className={styles.gradientWord}>before</span> you move
          </motion.h1>

          <motion.p
            className={styles.subtext}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
          >
            Real insights from real neighbors. Explore safety, water supply,
            noise, and community vibes before signing that lease.
          </motion.p>

          <motion.div
            className={styles.searchBox}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.4}
          >
            <div className={styles.searchInner}>
              <Search className={styles.searchIcon} aria-hidden />
              <input
                type="search"
                placeholder="Search locality, city, or society..."
                className={styles.searchInput}
                aria-label="Search locality"
              />
            </div>
            <Link href="/explore" className={styles.exploreBtn}>
              Explore
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

import styles from "./HowItWorks.module.scss";

const steps = [
  {
    num: "01",
    title: "Search area",
    desc: "Look up your current or potential locality, city, or specific housing society.",
    rotate: 3,
  },
  {
    num: "02",
    title: "Read reviews",
    desc: "Browse anonymous, verified insights from people who actually live there.",
    rotate: -3,
  },
  {
    num: "03",
    title: "Decide",
    desc: "Use real community data to make the best living decision for you.",
    rotate: 6,
  },
];

export default function HowItWorks() {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.glow1} aria-hidden />
      <div className={styles.glow2} aria-hidden />
      <h2 className={styles.title}>How it Works</h2>
      <div className={styles.grid}>
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            className={styles.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <div
              className={styles.numBox}
              style={{ transform: `rotate(${step.rotate}deg)` }}
            >
              <span className={styles.num}>{step.num}</span>
            </div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDesc}>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

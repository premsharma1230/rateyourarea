import { Star } from "lucide-react";

import styles from "./RatingBadge.module.scss";

export default function RatingBadge({ rating }) {
  const isLow = rating < 3;

  return (
    <div className={`${styles.badge} ${isLow ? styles.low : ""}`}>
      <span className={styles.value}>{rating.toFixed(1)}</span>
      <Star className={styles.star} fill="currentColor" aria-hidden />
    </div>
  );
}

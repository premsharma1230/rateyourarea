import { BadgeCheck, UserRound } from "lucide-react";

import styles from "./AnonymousBadge.module.scss";

export default function AnonymousBadge({ area, variant = "anonymous" }) {
  const isVerified = variant === "verified";

  return (
    <p
      className={`${styles.badge} ${isVerified ? styles.verified : styles.anonymous}`}
    >
      {isVerified ? (
        <BadgeCheck className={styles.icon} aria-hidden />
      ) : (
        <UserRound className={styles.icon} aria-hidden />
      )}
      {isVerified ? `Verified • ${area}` : `Anonymous • ${area}`}
    </p>
  );
}

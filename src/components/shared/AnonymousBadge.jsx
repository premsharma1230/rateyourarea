import { BadgeCheck } from "lucide-react";

import styles from "./AnonymousBadge.module.scss";

export default function AnonymousBadge({ area }) {
  return (
    <p className={styles.badge}>
      <BadgeCheck className={styles.icon} aria-hidden />
      Verified • {area}
    </p>
  );
}

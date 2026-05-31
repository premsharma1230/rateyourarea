import styles from "./AreaCardSkeleton.module.scss";

export default function AreaCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.image} />
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <div className={styles.title} />
          <div className={styles.badge} />
        </div>
        <div className={styles.line} />
        <div className={styles.lineShort} />
        <div className={styles.footer}>
          <div className={styles.footerLine} />
        </div>
      </div>
    </div>
  );
}

export function AreaCardSkeletonCount() {
  return <div className={styles.countLine} aria-hidden="true" />;
}

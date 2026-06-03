import styles from "./AreaCardSkeleton.module.scss";

export default function AreaCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.image} />
      <div className={styles.badge} />
      <div className={styles.content}>
        <div className={styles.title} />
        <div className={styles.line} />
        <div className={styles.lineShort} />
      </div>
    </div>
  );
}

export function AreaCardSkeletonCount() {
  return <div className={styles.countLine} aria-hidden="true" />;
}

import { areas } from "@/data/areas";
import AreaCard from "@/components/shared/AreaCard";
import styles from "../listing.module.scss";

export const metadata = {
  title: "Worst Rated Areas | RateYourArea",
};

export default function WorstRatedPage() {
  const sorted = [...areas].sort((a, b) => a.overallRating - b.overallRating);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Worst Rated Areas</h1>
        <p className={styles.subtitle}>
          Areas with the most complaints and lowest resident ratings.
        </p>
      </header>
      <div className={styles.grid}>
        {sorted.map((area, index) => (
          <AreaCard key={area.slug} area={area} index={index} />
        ))}
      </div>
    </div>
  );
}

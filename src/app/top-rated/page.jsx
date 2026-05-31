import { areas } from "@/data/areas";
import AreaCard from "@/components/shared/AreaCard";
import styles from "../listing.module.scss";

export const metadata = {
  title: "Top Rated Areas | RateYourArea",
};

export default function TopRatedPage() {
  const sorted = [...areas].sort((a, b) => b.overallRating - a.overallRating);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Top Rated Areas</h1>
        <p className={styles.subtitle}>
          Highest-rated societies, sectors, and localities by residents.
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

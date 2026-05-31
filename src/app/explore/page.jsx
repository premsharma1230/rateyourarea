import Link from "next/link";

import { areas } from "@/data/areas";
import AreaCard from "@/components/shared/AreaCard";
import styles from "../listing.module.scss";

export const metadata = {
  title: "Explore Areas | RateYourArea",
  description: "Browse societies, sectors, and localities across Indian cities.",
};

export default function ExplorePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Explore Areas</h1>
        <p className={styles.subtitle}>
          Discover localities, societies, and sectors rated by real residents.
        </p>
      </header>
      <div className={styles.grid}>
        {areas.map((area, index) => (
          <AreaCard key={area.slug} area={area} index={index} />
        ))}
      </div>
      <p className={styles.footer}>
        <Link href="/review">Can&apos;t find your area?</Link> — add a review to
        put it on the map.
      </p>
    </div>
  );
}

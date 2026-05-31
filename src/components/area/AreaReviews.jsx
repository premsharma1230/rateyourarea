"use client";

import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import ReviewCard from "@/components/shared/ReviewCard";
import Link from "next/link";
import styles from "./AreaReviews.module.scss";

export default function AreaReviews({ slug, areaName }) {
  const { getReviewsForArea, ready } = useCommunityData();
  const reviews = getReviewsForArea(slug);

  if (!ready) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Resident Reviews</h2>
        <p className={styles.subtitle}>
          {reviews.length > 0
            ? `${reviews.length} anonymous ${reviews.length === 1 ? "review" : "reviews"} for ${areaName}`
            : `No reviews yet for ${areaName}. Be the first!`}
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className={styles.empty}>
          <p>No one has reviewed this area yet.</p>
          <Link href="/review" className={styles.cta}>
            Write the first review
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} detailed />
          ))}
        </div>
      )}
    </section>
  );
}

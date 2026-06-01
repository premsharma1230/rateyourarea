"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import ReviewCardsCarousel from "@/components/shared/ReviewCardsCarousel";
import { sortReviews } from "@/lib/area-detail-utils";
import styles from "@/components/area/AreaReviews.module.scss";

const SORT_OPTIONS = [
  { id: "relevant", label: "Most Relevant" },
  { id: "recent", label: "Most Recent" },
  { id: "highest", label: "Highest Rated" },
  { id: "lowest", label: "Lowest Rated" },
];

export default function EntityReviews({ reviews, entityName, reviewHref }) {
  const [sortBy, setSortBy] = useState("relevant");

  const sortedReviews = useMemo(
    () => sortReviews(reviews, sortBy),
    [reviews, sortBy]
  );

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Reviews for {entityName}</h2>
        {reviews.length > 0 && (
          <div className={styles.sortWrap}>
            <label htmlFor="entity-review-sort" className="sr-only">
              Sort reviews
            </label>
            <select
              id="entity-review-sort"
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.sortIcon} aria-hidden />
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className={styles.empty}>
          <p>No reviews for {entityName} yet.</p>
          <Link href={reviewHref} className={styles.cta}>
            Write the first review
          </Link>
        </div>
      ) : (
        <ReviewCardsCarousel reviews={sortedReviews} />
      )}
    </section>
  );
}

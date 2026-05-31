"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import ReviewCard from "@/components/shared/ReviewCard";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import { sortReviews } from "@/lib/area-detail-utils";
import styles from "./AreaReviews.module.scss";

const PAGE_SIZE = 4;
const SORT_OPTIONS = [
  { id: "relevant", label: "Most Relevant" },
  { id: "recent", label: "Most Recent" },
  { id: "highest", label: "Highest Rated" },
  { id: "lowest", label: "Lowest Rated" },
];

export default function AreaReviews({ slug, areaName }) {
  const { getReviewsForArea, ready } = useCommunityData();
  const [sortBy, setSortBy] = useState("relevant");
  const [page, setPage] = useState(1);

  const reviews = getReviewsForArea(slug);

  const sortedReviews = useMemo(
    () => sortReviews(reviews, sortBy),
    [reviews, sortBy]
  );

  const totalPages = Math.max(1, Math.ceil(sortedReviews.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (!ready) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>What Residents Say</h2>
        {reviews.length > 0 && (
          <div className={styles.sortWrap}>
            <label htmlFor="review-sort" className="sr-only">
              Sort reviews
            </label>
            <select
              id="review-sort"
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
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
          <p>No one has reviewed {areaName} yet.</p>
          <Link href={`/review?area=${slug}`} className={styles.cta}>
            Write the first review
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {paginatedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} detailed />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`${styles.pageNumber} ${
                        pageNumber === currentPage ? styles.pageNumberActive : ""
                      }`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          )}

          <p className={styles.pageMeta}>
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, sortedReviews.length)} of{" "}
            {sortedReviews.length} reviews
          </p>
        </>
      )}
    </section>
  );
}

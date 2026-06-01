"use client";

import {
  BadgeCheck,
  Star,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import UserInitials from "@/components/shared/UserInitials";
import { textToTags } from "@/lib/area-detail-utils";
import {
  getReviewAuthorName,
  getReviewDisplayName,
  isReviewAnonymous,
} from "@/lib/review-display";
import styles from "./AreaDetailReviewCard.module.scss";

export default function AreaDetailReviewCard({ review }) {
  const { user } = useAuth();
  const anonymous = isReviewAnonymous(review);
  const displayName = getReviewDisplayName(review, user);
  const authorName = getReviewAuthorName(review, user);
  const prosTags = textToTags(review.pros);
  const consTags = textToTags(review.cons);
  const subtitle = [review.residentLabel, review.duration]
    .filter(Boolean)
    .join(" • ");
  const StatusIcon = anonymous ? UserRound : BadgeCheck;

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.author}>
          <div
            className={`${styles.avatar} ${anonymous ? styles.avatarAnonymous : styles.avatarVerified}`}
          >
            {anonymous ? (
              <UserRound
                className={styles.avatarIcon}
                strokeWidth={1.5}
                aria-hidden
              />
            ) : (
              <UserInitials
                name={displayName || "Resident"}
                email={user?.email}
                size="md"
                className={styles.initials}
              />
            )}
          </div>
          <div>
            <div className={styles.nameRow}>
              <h4 className={styles.name}>{authorName}</h4>
              <StatusIcon
                className={`${styles.statusIcon} ${anonymous ? styles.statusAnonymous : styles.statusVerified}`}
                aria-hidden
              />
            </div>
            <p
              className={`${styles.statusBadge} ${anonymous ? styles.statusAnonymous : styles.statusVerified}`}
            >
              {anonymous
                ? `Anonymous • ${review.areaName || "Area"}`
                : `Verified • ${review.areaName || "Area"}`}
            </p>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
        <div className={styles.scoreBadge}>{review.rating.toFixed(1)}</div>
      </div>

      <p className={styles.quote}>{review.quote}</p>

      {(prosTags.length > 0 || consTags.length > 0) && (
        <div className={styles.feedback}>
          {prosTags.length > 0 && (
            <div className={styles.feedbackBlock}>
              <div className={styles.feedbackLabel}>
                <ThumbsUp className="size-4" aria-hidden />
                Pros
              </div>
              <div className={styles.tagRow}>
                {prosTags.map((tag) => (
                  <span key={tag} className={`${styles.tag} ${styles.proTag}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {consTags.length > 0 && (
            <div className={styles.feedbackBlock}>
              <div className={`${styles.feedbackLabel} ${styles.consLabel}`}>
                <ThumbsDown className="size-4" aria-hidden />
                Cons
              </div>
              <div className={styles.tagRow}>
                {consTags.map((tag) => (
                  <span key={tag} className={`${styles.tag} ${styles.conTag}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {review.recommended !== undefined && review.recommended !== null && (
        <div className={styles.recommendRow}>
          {review.recommended ? (
            <span className={styles.recommendYes}>
              <ThumbsUp className="size-3.5" aria-hidden />
              Would recommend
            </span>
          ) : (
            <span className={styles.recommendNo}>
              <ThumbsDown className="size-3.5" aria-hidden />
              Would not recommend
            </span>
          )}
          {review.date && <span className={styles.date}>{review.date}</span>}
        </div>
      )}
    </article>
  );
}

export function AreaOverallStars({ rating }) {
  return (
    <div className={styles.starsRow} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = Math.round(rating) > index;
        return (
          <Star
            key={index}
            className={`${styles.star} ${filled ? styles.starFilled : ""}`}
            fill={filled ? "currentColor" : "none"}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

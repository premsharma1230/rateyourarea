"use client";

import {
  User,
  UserX,
  Shield,
  Droplets,
  TrainFront,
  Volume2,
  Car,
  Star,
  Wallet,
  Footprints,
  TrendingUp,
  AlertTriangle,
  Users,
  Zap,
  Wrench,
  ThumbsUp,
  ThumbsDown,
  Calendar,
} from "lucide-react";

import RatingBadge from "./RatingBadge";
import AnonymousBadge from "./AnonymousBadge";
import styles from "./ReviewCard.module.scss";

const iconMap = {
  shield: Shield,
  droplets: Droplets,
  train: TrainFront,
  "volume-2": Volume2,
  car: Car,
  star: Star,
  wallet: Wallet,
  footprints: Footprints,
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  users: Users,
  zap: Zap,
  wrench: Wrench,
};

export default function ReviewCard({ review, detailed = false }) {
  const AvatarIcon = review.avatarVariant === "error" ? UserX : User;

  return (
    <article className={`${styles.card} ${detailed ? styles.detailed : ""}`}>
      {review.isUserReview && <span className={styles.liveBadge}>Your review</span>}

      <div className={styles.top}>
        <div className={styles.author}>
          <div
            className={`${styles.avatar} ${review.avatarVariant === "error" ? styles.avatarError : ""}`}
          >
            <AvatarIcon className={styles.avatarIcon} aria-hidden />
          </div>
          <div>
            <h4 className={styles.name}>Anonymous Resident</h4>
            <AnonymousBadge area={review.areaName} />
            <div className={styles.meta}>
              {review.residentLabel && (
                <span className={styles.metaItem}>{review.residentLabel}</span>
              )}
              {review.duration && (
                <span className={styles.metaItem}>{review.duration}</span>
              )}
              {review.date && (
                <span className={styles.metaItem}>
                  <Calendar className="size-3.5" aria-hidden />
                  {review.date}
                </span>
              )}
            </div>
          </div>
        </div>
        <RatingBadge rating={review.rating} />
      </div>

      <p className={styles.quote}>&ldquo;{review.quote}&rdquo;</p>

      {detailed && (review.pros || review.cons) && (
        <div className={styles.prosCons}>
          {review.pros && (
            <div className={styles.prosBlock}>
              <h5 className={styles.blockTitle}>Pros</h5>
              <p>{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div className={styles.consBlock}>
              <h5 className={styles.blockTitle}>Cons</h5>
              <p>{review.cons}</p>
            </div>
          )}
        </div>
      )}

      {detailed && review.detailedRatings && (
        <div className={styles.ratingGrid}>
          {Object.entries(review.detailedRatings)
            .filter(([key, val]) => key !== "overall" && val > 0)
            .map(([key, val]) => (
              <div key={key} className={styles.ratingChip}>
                <span className={styles.ratingKey}>
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </span>
                <span className={styles.ratingVal}>{val}/5</span>
              </div>
            ))}
        </div>
      )}

      <div className={styles.footer}>
        <div className={styles.tags}>
          {review.tags?.map((tag) => {
            const Icon = iconMap[tag.icon] || Shield;
            return (
              <span
                key={tag.label}
                className={`${styles.tag} ${tag.variant === "error" ? styles.tagError : ""}`}
              >
                <Icon className={styles.tagIcon} aria-hidden />
                {tag.label}
              </span>
            );
          })}
        </div>

        {review.recommended !== undefined && review.recommended !== null && (
          <span
            className={`${styles.recommend} ${review.recommended ? styles.recommendYes : styles.recommendNo}`}
          >
            {review.recommended ? (
              <>
                <ThumbsUp className="size-4" aria-hidden />
                Recommends
              </>
            ) : (
              <>
                <ThumbsDown className="size-4" aria-hidden />
                Does not recommend
              </>
            )}
          </span>
        )}
      </div>
    </article>
  );
}

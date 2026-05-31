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
};

export default function ReviewCard({ review }) {
  const AvatarIcon = review.avatarVariant === "error" ? UserX : User;

  return (
    <article className={styles.card}>
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
          </div>
        </div>
        <RatingBadge rating={review.rating} />
      </div>
      <p className={styles.quote}>&ldquo;{review.quote}&rdquo;</p>
      <div className={styles.tags}>
        {review.tags.map((tag) => {
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
    </article>
  );
}

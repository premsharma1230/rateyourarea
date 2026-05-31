"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Droplets,
  Zap,
  Shield,
  Wrench,
  Wifi,
  Car,
  GraduationCap,
  Building2,
  AlertTriangle,
} from "lucide-react";

import AreaReviews from "@/components/area/AreaReviews";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import RatingBadge from "@/components/shared/RatingBadge";
import styles from "@/app/area/[slug]/page.module.scss";

const ratingIcons = {
  water: Droplets,
  power: Zap,
  security: Shield,
  maintenance: Wrench,
  internet: Wifi,
  parking: Car,
  schools: GraduationCap,
  builderTrust: Building2,
};

export default function AreaPageClient({ slug, staticArea }) {
  const { getAreaBySlug, getReviewsForArea, ready } = useCommunityData();
  const area = staticArea || (ready ? getAreaBySlug(slug) : null);
  const reviews = ready ? getReviewsForArea(slug) : [];

  if (ready && !area) notFound();

  if (!area) {
    return <div className={styles.page} aria-busy="true" />;
  }

  const reviewCount = reviews.length || area.totalReviews;
  const displayRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : area.overallRating;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroImage}>
          <Image
            src={area.image}
            alt={area.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.breadcrumb}>
            <Link href="/explore">{area.city}</Link>
            <span>/</span>
            <span>{area.name}</span>
          </div>
          <h1 className={styles.title}>{area.name}</h1>
          <p className={styles.description}>{area.description}</p>
          <div className={styles.meta}>
            <RatingBadge rating={displayRating} variant="dark-card" />
            <span className={styles.reviews}>
              {reviewCount}+ reviews
            </span>
            {area.reraComplaints > 0 && (
              <span className={styles.rera}>
                <AlertTriangle className="size-4" />
                {area.reraComplaints} RERA complaints
              </span>
            )}
            {area.isCustom && (
              <span className={styles.rera}>Community added</span>
            )}
          </div>
          <div className={styles.tags}>
            {area.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {!area.isCustom && (
          <section className={styles.ratingsSection}>
            <h2 className={styles.sectionTitle}>Detailed Ratings</h2>
            <div className={styles.ratingsGrid}>
              {Object.entries(area.ratings).map(([key, value]) => {
                const Icon = ratingIcons[key] || Building2;
                const label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s) => s.toUpperCase());
                return (
                  <div key={key} className={styles.ratingItem}>
                    <Icon className={styles.ratingIcon} aria-hidden />
                    <span className={styles.ratingName}>{label}</span>
                    <div className={styles.ratingBar}>
                      <div
                        className={styles.ratingFill}
                        style={{ width: `${(value / 5) * 100}%` }}
                      />
                    </div>
                    <span className={styles.ratingValue}>{value.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <AreaReviews slug={slug} areaName={area.name} />

        <div className={styles.twoCol}>
          {!area.isCustom && area.pros?.length > 0 && (
            <section className={styles.prosCons}>
              <h3 className={styles.prosTitle}>Pros</h3>
              <ul>
                {area.pros.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <h3 className={styles.consTitle}>Cons</h3>
              <ul>
                {area.cons.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          )}
          <aside className={styles.cta}>
            <h3>Lived here?</h3>
            <p>Share your anonymous experience with the community.</p>
            <Link href="/review" className={styles.ctaBtn}>
              Write a Review
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

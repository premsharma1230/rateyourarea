"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, MapPin, MessageSquarePlus } from "lucide-react";

import AreaReviews from "@/components/area/AreaReviews";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import AreaMap from "@/components/shared/AreaMap";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { buildExploreBreadcrumbs } from "@/lib/explore-nav";
import RatingBadge from "@/components/shared/RatingBadge";
import { buildGoogleMapsUrl } from "@/lib/osm-geocoding";
import {
  RATING_LABELS,
  computeAggregateRatings,
  getRatingBarTone,
} from "@/lib/area-detail-utils";
import styles from "@/app/area/[slug]/page.module.scss";

const UPDATED_LABEL = new Date().toLocaleDateString("en-IN", {
  month: "short",
  year: "numeric",
});

const TONE_CLASS = {
  good: styles.toneGood,
  mid: styles.toneMid,
  low: styles.toneLow,
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
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : area.overallRating;

  const aggregateRatings = computeAggregateRatings(area, reviews);
  const mapsUrl = buildGoogleMapsUrl(area);
  const breadcrumbItems = buildExploreBreadcrumbs(area.type ?? "all", area.name);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroImage}>
          <Image
            src={area.image}
            alt={area.name}
            fill
            className={styles.heroImg}
            priority
            sizes="100vw"
          />
        </div>
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroContent}>
          <Breadcrumbs items={breadcrumbItems} variant="onDark" />
          <h1 className={styles.title}>{area.name}</h1>
          <p className={styles.description}>{area.description}</p>
          <div className={styles.meta}>
            <RatingBadge rating={displayRating} />
            <span className={styles.reviews}>{reviewCount}+ reviews</span>
            {area.reraComplaints > 0 && (
              <span className={styles.rera}>
                <AlertTriangle className="size-4" />
                {area.reraComplaints} RERA complaints
              </span>
            )}
            {area.isCustom && (
              <span className={styles.communityTag}>Community added</span>
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

      <div className={styles.content}>
        <div className={styles.dashboard}>
          <section className={styles.reportCard}>
            <div className={styles.reportHeader}>
              <h2 className={styles.reportTitle}>Intelligence Report Card</h2>
              <span className={styles.updatedAt}>Updated: {UPDATED_LABEL}</span>
            </div>

            <div className={styles.metricsGrid}>
              {Object.entries(RATING_LABELS).map(([key, label]) => {
                const value = aggregateRatings[key] ?? 0;
                const tone = getRatingBarTone(value);

                return (
                  <div key={key} className={styles.metricItem}>
                    <div className={styles.metricTop}>
                      <span className={styles.metricLabel}>{label}</span>
                      <span className={styles.metricValue}>
                        {value.toFixed(1)}
                        <span className={styles.metricMax}>/5</span>
                      </span>
                    </div>
                    <div className={styles.metricBar}>
                      <div
                        className={`${styles.metricFill} ${TONE_CLASS[tone]}`}
                        style={{ width: `${(value / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className={styles.sidebar}>
            <div className={styles.ratingCard}>
              <p className={styles.ratingLabel}>Overall Community Rating</p>
              <div className={styles.ratingValueLarge}>
                {displayRating.toFixed(1)}
              </div>
              <div className={styles.ratingBadgeWrap}>
                <RatingBadge rating={displayRating} />
              </div>
              <p className={styles.ratingMeta}>
                Based on {reviewCount.toLocaleString()} verified resident reviews
                from the last 12 months.
              </p>
            </div>

            <div className={styles.reviewPrompt}>
              <h3>Lived here before?</h3>
              <p>
                Help others make an informed decision by sharing your honest
                experience of {area.name}.
              </p>
              <Link href={`/review?area=${slug}`} className={styles.reviewBtn}>
                <MessageSquarePlus className="size-5" aria-hidden />
                Add Your Review
              </Link>
            </div>

            <div className={styles.mapCard}>
              <div className={styles.mapImageWrap}>
                <AreaMap area={area} />
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapBtn}
              >
                <MapPin className="size-4" aria-hidden />
                Open in Google Maps
              </a>
            </div>
          </aside>
        </div>

        <AreaReviews slug={slug} areaName={area.name} />
      </div>
    </div>
  );
}

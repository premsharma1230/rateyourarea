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

import { getAreaBySlug, areas } from "@/data/areas";
import RatingBadge from "@/components/shared/RatingBadge";
import styles from "./page.module.scss";

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

export function generateStaticParams() {
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) return { title: "Area Not Found" };
  return {
    title: `${area.name} Reviews | RateYourArea`,
    description: area.description,
  };
}

export default async function AreaPage({ params }) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);

  if (!area) notFound();

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
            <RatingBadge rating={area.overallRating} variant="dark-card" />
            <span className={styles.reviews}>
              {area.totalReviews}+ reviews
            </span>
            {area.reraComplaints > 0 && (
              <span className={styles.rera}>
                <AlertTriangle className="size-4" />
                {area.reraComplaints} RERA complaints
              </span>
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

        <div className={styles.twoCol}>
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

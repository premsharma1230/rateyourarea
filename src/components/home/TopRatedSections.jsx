"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import TopEntityCard from "@/components/home/TopEntityCard";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import {
  TOP_SECTIONS,
  aggregateTopAreasFromList,
  aggregateTopEntities,
} from "@/lib/top-entities";
import styles from "./TopRatedSections.module.scss";

const CAROUSEL_OPTS = {
  align: "start",
  containScroll: "trimSnaps",
  dragFree: false,
  slidesToScroll: 1,
};

function TopSectionRow({ section, entities }) {
  if (!entities.length) return null;

  return (
    <section className={styles.section}>
      <Carousel opts={CAROUSEL_OPTS} className={styles.carousel}>
        <div className={styles.sectionHeader}>
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>{section.title}</h2>
            {section.subtitle ? (
              <p className={styles.subtitle}>{section.subtitle}</p>
            ) : null}
            <Link href={section.viewAllHref || "/explore"} className={styles.viewAll}>
              View all
              <ArrowRight className={styles.arrow} aria-hidden />
            </Link>
          </div>
          <div className={styles.navGroup}>
            <CarouselPrevious className={cn(styles.navBtn)} />
            <CarouselNext className={cn(styles.navBtn)} />
          </div>
        </div>

        <div className={styles.carouselViewport}>
          <CarouselContent className={styles.carouselTrack}>
            {entities.map((entity) => (
              <CarouselItem
                key={`${entity.type}-${entity.key}`}
                className={styles.carouselItem}
              >
                <div className={styles.slideInner}>
                  <TopEntityCard entity={entity} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  );
}

export default function TopRatedSections() {
  const { allReviews, allAreas, supabaseAreas, supabasePgs, ready } = useCommunityData();

  if (!ready) {
    return <div className={styles.loading} aria-busy="true" />;
  }

  const sections = TOP_SECTIONS.map((section) => {
    let entities = [];

    if (section.id === "pg" && supabasePgs.length > 0) {
      entities = aggregateTopAreasFromList(
        supabasePgs,
        section.types,
        10,
        allReviews
      );
    } else if (section.fromAreas && supabaseAreas.length > 0) {
      entities = aggregateTopAreasFromList(
        supabaseAreas,
        section.types,
        10,
        allReviews
      );
    } else if (section.fromAreas) {
      entities = aggregateTopAreasFromList(
        allAreas,
        section.types,
        10,
        allReviews
      );
    } else {
      entities = aggregateTopEntities(allReviews, allAreas, section.types, 10);
    }

    return { section, entities };
  }).filter(({ entities }) => entities.length > 0);

  if (!sections.length) return null;

  return (
    <div className={styles.wrapper}>
      {sections.map(({ section, entities }) => (
        <TopSectionRow key={section.id} section={section} entities={entities} />
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
import { TOP_SECTIONS, aggregateTopEntities } from "@/lib/top-entities";
import styles from "./TopRatedSections.module.scss";

const CAROUSEL_OPTS = {
  align: "start",
  containScroll: "trimSnaps",
  dragFree: false,
};

function TopSectionRow({ section, entities }) {
  if (!entities.length) return null;

  return (
    <section className={styles.section}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div>
          <h2 className={styles.title}>{section.title}</h2>
          <p className={styles.subtitle}>{section.subtitle}</p>
        </div>
        <Link href="/explore" className={styles.viewAll}>
          View all
          <ArrowRight className={styles.arrow} aria-hidden />
        </Link>
      </motion.div>
      <Carousel opts={CAROUSEL_OPTS} className={styles.carousel}>
        <CarouselContent className={styles.carouselContent}>
          {entities.map((entity, index) => (
            <CarouselItem key={`${entity.type}-${entity.key}`} className={styles.carouselItem}>
              <TopEntityCard entity={entity} index={index} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={cn(styles.navBtn, styles.navPrev)} />
        <CarouselNext className={cn(styles.navBtn, styles.navNext)} />
      </Carousel>
    </section>
  );
}

export default function TopRatedSections() {
  const { allReviews, allAreas, ready } = useCommunityData();

  if (!ready) {
    return <div className={styles.loading} aria-busy="true" />;
  }

  const sections = TOP_SECTIONS.map((section) => ({
    section,
    entities: aggregateTopEntities(
      allReviews,
      allAreas,
      section.types,
      10
    ),
  })).filter(({ entities }) => entities.length > 0);

  if (!sections.length) return null;

  return (
    <div className={styles.wrapper}>
      {sections.map(({ section, entities }) => (
        <TopSectionRow key={section.id} section={section} entities={entities} />
      ))}
    </div>
  );
}

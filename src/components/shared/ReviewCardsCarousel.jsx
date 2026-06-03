"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ReviewCard from "@/components/shared/ReviewCard";
import { cn } from "@/lib/utils";
import styles from "./ReviewCardsCarousel.module.scss";

const CAROUSEL_OPTS = {
  align: "start",
  containScroll: "trimSnaps",
};

function ReviewCarouselDots({ api }) {
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const update = useCallback(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    setSnapCount(api.scrollSnapList().length);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api, update]);

  if (snapCount <= 1) return null;

  return (
    <div className={styles.dots} role="tablist" aria-label="Review slides">
      {Array.from({ length: snapCount }, (_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === selected}
          aria-label={`Go to slide ${index + 1}`}
          className={cn(styles.dot, index === selected && styles.dotActive)}
          onPointerDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            api.scrollTo(index);
          }}
        />
      ))}
    </div>
  );
}

export default function ReviewCardsCarousel({
  reviews = [],
  emptyMessage = "No reviews yet.",
  variant = "default",
}) {
  const [api, setApi] = useState(null);

  if (!reviews.length) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  const isThreeUp = variant === "threeUp";
  const showNav = isThreeUp
    ? reviews.length > 2
    : reviews.length > 1;

  return (
    <div className={cn(styles.wrap, isThreeUp && styles.wrapThreeUp)}>
      <Carousel opts={CAROUSEL_OPTS} setApi={setApi} className={styles.carousel}>
        <div className={styles.stage}>
          <CarouselContent
            viewportClassName={styles.emblaViewport}
            className={styles.track}
          >
            {reviews.map((review) => (
              <CarouselItem
                key={review.id}
                className={cn(styles.item, isThreeUp && styles.itemThreeUp)}
              >
                <ReviewCard review={review} detailed />
              </CarouselItem>
            ))}
          </CarouselContent>
          {showNav ? (
            <>
              <CarouselPrevious className={cn(styles.nav, styles.navPrev)} />
              <CarouselNext className={cn(styles.nav, styles.navNext)} />
            </>
          ) : null}
        </div>
      </Carousel>
      <ReviewCarouselDots api={api} />
    </div>
  );
}

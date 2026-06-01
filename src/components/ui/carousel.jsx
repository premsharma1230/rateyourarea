"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, viewportClassName, ...props }) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className={cn("overflow-hidden", viewportClassName)}
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
}

const navButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-full border outline-none select-none transition-[background,border-color,opacity,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-35 [&_svg]:pointer-events-none [&_svg]:shrink-0";

function CarouselPrevious({ className, onClick, onPointerDown, ...props }) {
  const { orientation, scrollPrev } = useCarousel();

  return (
    <button
      type="button"
      className={cn(
        navButtonClass,
        "absolute size-8",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        onPointerDown?.(e);
      }}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        scrollPrev();
      }}
      {...props}
    >
      <ArrowLeft className="size-4" aria-hidden />
      <span className="sr-only">Previous slide</span>
    </button>
  );
}

function CarouselNext({ className, onClick, onPointerDown, ...props }) {
  const { orientation, scrollNext } = useCarousel();

  return (
    <button
      type="button"
      className={cn(
        navButtonClass,
        "absolute size-8",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        onPointerDown?.(e);
      }}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        scrollNext();
      }}
      {...props}
    >
      <ArrowRight className="size-4" aria-hidden />
      <span className="sr-only">Next slide</span>
    </button>
  );
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};

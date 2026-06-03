"use client";

import { useMemo } from "react";

import { resolveEntityImage } from "@/lib/entity-images";

export function usePlacePhoto(place) {
  const normalized = useMemo(() => {
    if (!place) return null;
    return {
      ...place,
      areaSlug: place.areaSlug || place.slug || place.nameSlug || null,
    };
  }, [place]);

  const photoUrl = useMemo(
    () => (normalized ? resolveEntityImage(normalized) : ""),
    [normalized]
  );

  return { photoUrl, loading: false };
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { areas as staticAreas } from "@/data/areas";
import { reviews as staticReviews } from "@/data/reviews";
import {
  buildReviewFromForm,
  createCustomArea,
  getCustomAreas,
  getStoredReviews,
  saveCustomArea,
  saveReview,
} from "@/lib/client-db";

const CommunityDataContext = createContext(null);

export function CommunityDataProvider({ children }) {
  const [customAreas, setCustomAreas] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setCustomAreas(getCustomAreas());
    setUserReviews(getStoredReviews());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);

    const onUpdate = () => refresh();
    window.addEventListener("rateyourarea-data-update", onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      window.removeEventListener("rateyourarea-data-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const allAreas = useMemo(
    () => [...staticAreas, ...customAreas],
    [customAreas]
  );

  const allReviews = useMemo(
    () =>
      [...userReviews, ...staticReviews].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      ),
    [userReviews]
  );

  const submitReview = useCallback(
    ({ form, selectedArea, isNewArea, newAreaMeta }) => {
      let area = selectedArea;

      if (isNewArea) {
        const customArea = createCustomArea({
          name: form.area.trim(),
          type: newAreaMeta.type,
          sector: newAreaMeta.sector || null,
          googlePlaceId: newAreaMeta.googlePlaceId || null,
          osmPlaceId: newAreaMeta.osmPlaceId || null,
          address: newAreaMeta.address || null,
          lat: newAreaMeta.lat ?? null,
          lng: newAreaMeta.lng ?? null,
        });
        saveCustomArea(customArea);
        area = customArea;
      }

      const review = buildReviewFromForm(form, area);
      saveReview(review);
      window.dispatchEvent(new Event("rateyourarea-data-update"));
      refresh();

      return { review, area };
    },
    [refresh]
  );

  const getAreaBySlug = useCallback(
    (slug) => allAreas.find((a) => a.slug === slug),
    [allAreas]
  );

  const getReviewsForArea = useCallback(
    (slug) => allReviews.filter((r) => r.areaSlug === slug),
    [allReviews]
  );

  return (
    <CommunityDataContext.Provider
      value={{
        ready,
        allAreas,
        allReviews,
        customAreas,
        userReviews,
        submitReview,
        getAreaBySlug,
        getReviewsForArea,
        refresh,
      }}
    >
      {children}
    </CommunityDataContext.Provider>
  );
}

export function useCommunityData() {
  const ctx = useContext(CommunityDataContext);
  if (!ctx) {
    throw new Error("useCommunityData must be used within CommunityDataProvider");
  }
  return ctx;
}

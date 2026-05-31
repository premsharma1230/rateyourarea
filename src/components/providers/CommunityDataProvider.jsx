"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { areas as staticAreas } from "@/data/areas";
import { reviews as staticReviews } from "@/data/reviews";
import {
  fetchPublishedReviews,
  mapDbReviewToClient,
  submitAnonymousReview,
  submitUserReview,
} from "@/backend/api/reviews";
import { isSupabaseConfigured } from "@/backend/lib/config";
import {
  buildReviewFromForm,
  createCustomArea,
  getCustomAreas,
  getStoredReviews,
  saveCustomArea,
  saveReview,
} from "@/lib/client-db";

function resolveReviewerDisplayName(user) {
  const name = user?.name?.trim();
  if (name && name !== "Resident") return name;
  return user?.email?.split("@")[0]?.trim() || null;
}

function enrichReviewForAuthUser(review, user) {
  if (!user?.id) return review;

  const isOwnReview = review.userId === user.id;

  if (!isOwnReview) return review;

  const displayName = review.reviewerDisplayName?.trim() || resolveReviewerDisplayName(user);
  if (!displayName) return review;

  return {
    ...review,
    isAnonymous: false,
    reviewerDisplayName: displayName,
  };
}

const CommunityDataContext = createContext(null);

export function CommunityDataProvider({ children }) {
  const { user, isLoggedIn } = useAuth();
  const [customAreas, setCustomAreas] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [supabaseReviews, setSupabaseReviews] = useState([]);
  const [ready, setReady] = useState(false);

  const refreshLocal = useCallback(() => {
    setCustomAreas(getCustomAreas());
    setUserReviews(getStoredReviews());
  }, []);

  const refreshSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSupabaseReviews([]);
      return;
    }

    const { data, error } = await fetchPublishedReviews();
    if (error || !data) {
      setSupabaseReviews([]);
      return;
    }

    setSupabaseReviews(data.map((row) => mapDbReviewToClient(row)));
  }, []);

  const refresh = useCallback(async () => {
    refreshLocal();
    await refreshSupabase();
  }, [refreshLocal, refreshSupabase]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      await refresh();
      if (mounted) setReady(true);
    })();

    const onUpdate = () => {
      refresh();
    };
    window.addEventListener("rateyourarea-data-update", onUpdate);
    window.addEventListener("storage", onUpdate);

    return () => {
      mounted = false;
      window.removeEventListener("rateyourarea-data-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const allAreas = useMemo(
    () => [...staticAreas, ...customAreas],
    [customAreas]
  );

  const allReviews = useMemo(() => {
    const merged = [...userReviews, ...supabaseReviews, ...staticReviews].map(
      (review) => enrichReviewForAuthUser(review, user)
    );
    return merged.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [userReviews, supabaseReviews, user]);

  const submitReview = useCallback(
    async ({ form, selectedArea, isNewArea, newAreaMeta }) => {
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

      if (isSupabaseConfigured()) {
        const reviewData = {
          areaSlug: area.slug,
          areaId: area.id || null,
          reviewTargetType: form.reviewTargetType,
          reviewTargetName: form.reviewTargetName?.trim() || null,
          residentType: form.residentType,
          residentSince: form.residentSince || null,
          duration: form.duration,
          ratings: form.ratings,
          pros: form.pros,
          cons: form.cons,
          tags: form.issues || [],
          recommended: form.recommend,
        };

        const reviewerDisplayName = resolveReviewerDisplayName(user);

        const result =
          isLoggedIn && user?.id
            ? await submitUserReview(reviewData, user.id, reviewerDisplayName)
            : await submitAnonymousReview(reviewData);

        if (result.error) {
          throw result.error;
        }

        const row = result.data?.[0];
        const review = enrichReviewForAuthUser(
          {
            ...mapDbReviewToClient(row, area.name),
            areaName: area.name,
            areaType: area.type,
          },
          user
        );

        window.dispatchEvent(new Event("rateyourarea-data-update"));
        await refresh();

        return { review, area };
      }

      const review = buildReviewFromForm(form, area, {
        isAnonymous: !isLoggedIn,
        reviewerDisplayName: isLoggedIn ? resolveReviewerDisplayName(user) : null,
      });
      saveReview(review);
      window.dispatchEvent(new Event("rateyourarea-data-update"));
      refreshLocal();

      return { review, area };
    },
    [refresh, refreshLocal, isLoggedIn, user]
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
        supabaseReviews,
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

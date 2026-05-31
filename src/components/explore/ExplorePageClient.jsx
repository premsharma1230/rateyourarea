"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import AreaCard from "@/components/shared/AreaCard";
import AreaCardSkeleton, {
  AreaCardSkeletonCount,
} from "@/components/shared/AreaCardSkeleton";
import PaginatedList from "@/components/shared/PaginatedList";
import ExploreFilters from "@/components/explore/ExploreFilters";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import { filterAreas } from "@/data/areas";
import listingStyles from "@/app/listing.module.scss";
import styles from "./ExplorePage.module.scss";

const DEFAULT_CITY = "Gurugram";
const PAGE_SIZE = 9;

export default function ExplorePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { allAreas, ready } = useCommunityData();

  const city = searchParams.get("city") || DEFAULT_CITY;
  const sector = searchParams.get("sector") || "";
  const society = searchParams.get("society") || "";
  const pg = searchParams.get("pg") || "";
  const type = searchParams.get("type") || "all";
  const query = searchParams.get("q") || "";
  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const updateParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      const isPageOnly =
        Object.keys(updates).length === 1 && Object.hasOwn(updates, "page");

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      if (!isPageOnly && !Object.hasOwn(updates, "page")) {
        params.delete("page");
      }

      const qs = params.toString();
      router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
    },
    [router, searchParams]
  );

  const handleSectorChange = (value) => {
    updateParams({ sector: value, society: "", pg: "" });
  };

  const handleSocietyChange = (value) => {
    updateParams({ society: value, pg: "" });
  };

  const handlePGChange = (value) => {
    updateParams({ pg: value, society: "" });
  };

  const results = useMemo(
    () =>
      filterAreas(
        {
          city: DEFAULT_CITY,
          sector,
          society,
          pg,
          type,
          query,
        },
        allAreas
      ),
    [allAreas, sector, society, pg, type, query]
  );

  return (
    <div className={listingStyles.page}>
      <header className={listingStyles.header}>
        <h1 className={listingStyles.title}>Explore Areas</h1>
        <p className={listingStyles.subtitle}>
          Browse societies, sectors, PGs and flats in Gurugram — rated by real
          residents.
        </p>
      </header>

      <ExploreFilters
        city={city}
        sector={sector}
        society={society}
        pg={pg}
        type={type}
        query={query}
        onCityChange={(v) => updateParams({ city: v })}
        onSectorChange={handleSectorChange}
        onSocietyChange={handleSocietyChange}
        onPGChange={handlePGChange}
        onTypeChange={(v) => updateParams({ type: v })}
        onQueryChange={(v) => updateParams({ q: v })}
      />

      {!ready ? (
        <>
          <AreaCardSkeletonCount />
          <div
            className={listingStyles.grid}
            aria-busy="true"
            aria-label="Loading areas"
          >
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <AreaCardSkeleton key={i} />
            ))}
          </div>
        </>
      ) : (
        <>
          <p className={styles.count}>
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>

          {results.length === 0 ? (
            <p className={styles.empty}>
              No areas match your filters. Try a different sector, society, or
              search term.
            </p>
          ) : (
            <PaginatedList
              items={results}
              pageSize={PAGE_SIZE}
              page={page}
              onPageChange={(nextPage) =>
                updateParams({ page: nextPage === 1 ? "" : String(nextPage) })
              }
              className={listingStyles.grid}
              emptyMessage=""
              renderItem={(area, index) => (
                <AreaCard key={area.slug} area={area} index={index} />
              )}
            />
          )}
        </>
      )}

      <p className={listingStyles.footer}>
        <Link href="/review">Can&apos;t find your area?</Link> — add a review to
        put it on the map.
      </p>
    </div>
  );
}

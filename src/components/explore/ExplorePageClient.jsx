"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import AreaCard from "@/components/shared/AreaCard";
import AreaCardSkeleton, {
  AreaCardSkeletonCount,
} from "@/components/shared/AreaCardSkeleton";
import PaginatedList from "@/components/shared/PaginatedList";
import ExploreFilters from "@/components/explore/ExploreFilters";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { filterAreas } from "@/data/areas";
import { buildExploreBreadcrumbs, getExplorePageTitle } from "@/lib/explore-nav";
import { filterPGListings } from "@/lib/filter-pgs";
import listingStyles from "@/app/listing.module.scss";
import styles from "./ExplorePage.module.scss";

const DEFAULT_CITY = "Gurugram";
/** Full rows on 2/3/4-column grids (12 = 4×3) */
const PAGE_SIZE = 12;

export default function ExplorePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { allAreas, supabaseAreas, supabasePgs, ready } = useCommunityData();

  const city = searchParams.get("city") || DEFAULT_CITY;
  const sector = searchParams.get("sector") || "";
  const society = searchParams.get("society") || "";
  const pg = searchParams.get("pg") || "";
  const type = searchParams.get("type") || "all";
  const query = searchParams.get("q") || "";
  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const urlPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const [page, setPage] = useState(urlPage);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPage(urlPage);
  }, [urlPage]);

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

  const isPgBrowse = type === "pg";
  const areaListingSource =
    supabaseAreas.length > 0 ? supabaseAreas : allAreas;

  const results = useMemo(() => {
    if (isPgBrowse) {
      return filterPGListings(
        { city: DEFAULT_CITY, sector, pg, query },
        supabasePgs
      );
    }

    return filterAreas(
      {
        city: DEFAULT_CITY,
        sector,
        society,
        pg: "",
        type,
        query,
      },
      areaListingSource
    );
  }, [
    isPgBrowse,
    supabasePgs,
    areaListingSource,
    sector,
    society,
    type,
    query,
  ]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (urlPage !== safePage) {
      startTransition(() => {
        updateParams({ page: safePage === 1 ? "" : String(safePage) });
      });
    }
  }, [urlPage, safePage, updateParams]);

  const breadcrumbItems = buildExploreBreadcrumbs(type);
  const pageTitle = getExplorePageTitle(type);

  const handlePageChange = useCallback(
    (nextPage) => {
      setPage(nextPage);
      startTransition(() => {
        updateParams({ page: nextPage === 1 ? "" : String(nextPage) });
      });
    },
    [updateParams]
  );

  return (
    <div className={listingStyles.page}>
      <header className={listingStyles.header}>
        <Breadcrumbs items={breadcrumbItems} />
        <h1 className={listingStyles.title}>{pageTitle}</h1>
        <p className={listingStyles.subtitle}>
          {isPgBrowse
            ? "Browse PG and hostel listings in Gurugram — rated by residents."
            : "Browse societies, sectors, PGs and flats in Gurugram — rated by real residents."}
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
        onTypeChange={(v) =>
          updateParams({
            type: v,
            ...(v === "pg"
              ? { society: "", sector: "" }
              : v !== "all"
                ? { pg: "" }
                : {}),
          })
        }
        onQueryChange={(v) => updateParams({ q: v })}
      />

      {!ready ? (
        <>
          <div className={styles.resultsMeta}>
            <AreaCardSkeletonCount />
          </div>
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
          <div className={styles.resultsMeta}>
            <p className={styles.count}>
              {results.length} {results.length === 1 ? "result" : "results"}
              {results.length > PAGE_SIZE ? (
                <span className={styles.countRange}>
                  {" "}
                  · showing {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, results.length)}
                </span>
              ) : null}
            </p>
          </div>

          {results.length === 0 ? (
            <p className={styles.empty}>
              {isPgBrowse && supabasePgs.length === 0
                ? "PG data nahi mili — pg_data table empty hai ya CSV dubara import karo. Supabase SQL: recreate_pg_data_table.sql"
                : !isPgBrowse && supabaseAreas.length === 0
                  ? "Area data load nahi hua. Supabase mein enable_areas_read.sql chalao."
                  : "No listings match your filters. Try a different search."}
            </p>
          ) : (
            <PaginatedList
              items={results}
              pageSize={PAGE_SIZE}
              page={safePage}
              onPageChange={handlePageChange}
              scrollOnPageChange
              className={listingStyles.grid}
              paginationClassName={styles.pagination}
              emptyMessage=""
              renderItem={(area, index, pageNum) => (
                <AreaCard
                  key={`${area.slug}-p${pageNum}`}
                  area={area}
                  index={index}
                  animateOnMount
                />
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

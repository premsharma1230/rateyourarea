"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import AreaCard from "@/components/shared/AreaCard";
import ExploreFilters from "@/components/explore/ExploreFilters";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import { filterAreas } from "@/data/areas";
import listingStyles from "@/app/listing.module.scss";
import styles from "./ExplorePage.module.scss";

const DEFAULT_CITY = "Gurugram";

export default function ExplorePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { allAreas } = useCommunityData();

  const city = searchParams.get("city") || DEFAULT_CITY;
  const sector = searchParams.get("sector") || "";
  const society = searchParams.get("society") || "";
  const pg = searchParams.get("pg") || "";
  const type = searchParams.get("type") || "all";
  const query = searchParams.get("q") || "";

  const updateParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

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

      <p className={styles.count}>
        {results.length} {results.length === 1 ? "result" : "results"}
      </p>

      {results.length === 0 ? (
        <p className={styles.empty}>
          No areas match your filters. Try a different sector, society, or search
          term.
        </p>
      ) : (
        <div className={listingStyles.grid}>
          {results.map((area, index) => (
            <AreaCard key={area.slug} area={area} index={index} />
          ))}
        </div>
      )}

      <p className={listingStyles.footer}>
        <Link href="/review">Can&apos;t find your area?</Link> — add a review to
        put it on the map.
      </p>
    </div>
  );
}

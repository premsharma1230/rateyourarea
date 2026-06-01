"use client";

import SearchBar from "@/components/shared/SearchBar";
import SearchableFilter from "@/components/shared/SearchableFilter";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import {
  ACTIVE_CITIES,
  EXPLORE_TYPES,
  getPGs,
  getSectors,
  getSocieties,
} from "@/data/areas";
import { normalizeSectorId } from "@/data/gurugram-sectors";
import styles from "./ExplorePage.module.scss";

export default function ExploreFilters({
  city,
  sector,
  society,
  pg,
  type,
  query,
  onCityChange,
  onSectorChange,
  onSocietyChange,
  onPGChange,
  onTypeChange,
  onQueryChange,
}) {
  const { allAreas, supabaseAreas, supabasePgs, ready } = useCommunityData();
  const areaSource =
    supabaseAreas.length > 0 ? supabaseAreas : allAreas;
  const sectors = getSectors(city, areaSource);
  const societies = getSocieties(city, sector, areaSource);
  const pgSource =
    supabasePgs.length > 0 ? supabasePgs : getPGs(city, sector, allAreas);

  const cityOptions = ACTIVE_CITIES.map((item) => ({
    value: item.id,
    label: `${item.label} (${item.aliases[0]})`,
  }));

  const sectorOptions = sectors.map((item, index) => ({
    key: `${item.sector}-${index}`,
    value: item.sector,
    label: item.name,
    meta: "Sector",
  }));

  const societyOptions = societies.map((item, index) => ({
    key: item.id || `${item.slug}-${index}`,
    value: item.slug,
    label: item.name,
    meta: item.sector ? `Sector ${item.sector}` : "Society",
  }));

  const pgOptions = pgSource.map((item, index) => ({
    key: item.id || `${item.slug}-${index}`,
    value: item.slug,
    label: item.name,
    meta: item.sector ? `Sector ${item.sector}` : "PG",
  }));

  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <SearchableFilter
          label="City"
          value={city}
          onChange={onCityChange}
          options={cityOptions}
          placeholder="Type city…"
          allLabel="All cities"
          allowCustom={false}
        />

        <SearchableFilter
          label="Sector"
          value={sector}
          onChange={(value) => onSectorChange(value ? normalizeSectorId(value) : "")}
          options={sectorOptions}
          placeholder="Type sector e.g. 21A"
          allLabel="All sectors"
        />

        <SearchableFilter
          label="Society"
          value={society}
          onChange={onSocietyChange}
          options={societyOptions}
          placeholder="Type society name…"
          allLabel="All societies"
          optionLimit={ready && supabaseAreas.length > 0 ? 100 : 12}
        />

        <SearchableFilter
          label="PG"
          value={pg}
          onChange={onPGChange}
          options={pgOptions}
          placeholder="Type PG name…"
          allLabel="All PGs"
          optionLimit={ready && supabasePgs.length > 0 ? 100 : 12}
        />

        <div className={`${styles.field} ${styles.searchWrap}`}>
          <span className={styles.label}>Search</span>
          <SearchBar
            placeholder="Search society, PG, or sector..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.typeTabs}>
        {EXPLORE_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.typeTab} ${type === t.id ? styles.active : ""}`}
            onClick={() => onTypeChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

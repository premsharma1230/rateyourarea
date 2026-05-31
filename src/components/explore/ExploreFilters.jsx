"use client";

import SearchBar from "@/components/shared/SearchBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACTIVE_CITIES,
  EXPLORE_TYPES,
  getPGs,
  getSectors,
  getSocieties,
} from "@/data/areas";
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
  const sectors = getSectors(city);
  const societies = getSocieties(city, sector);
  const pgs = getPGs(city, sector);

  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <div className={styles.field}>
          <span className={styles.label}>City</span>
          <Select value={city} onValueChange={onCityChange}>
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVE_CITIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label} ({c.aliases[0]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Sector</span>
          <Select
            value={sector || "all"}
            onValueChange={(v) => onSectorChange(v === "all" ? "" : v)}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue placeholder="All sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sectors</SelectItem>
              {sectors.map((s) => (
                <SelectItem key={s.slug} value={s.sector}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Society</span>
          <Select
            value={society || "all"}
            onValueChange={(v) => onSocietyChange(v === "all" ? "" : v)}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue placeholder="All societies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All societies</SelectItem>
              {societies.map((s) => (
                <SelectItem key={s.slug} value={s.slug}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>PG</span>
          <Select
            value={pg || "all"}
            onValueChange={(v) => onPGChange(v === "all" ? "" : v)}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <SelectValue placeholder="All PGs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PGs</SelectItem>
              {pgs.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

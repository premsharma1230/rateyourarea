"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import { buildNewAreaMetaFromGoogle, normalizePlaceLabel } from "@/lib/google-places";
import styles from "./AreaPicker.module.scss";

const AREA_TYPES = [
  { id: "society", label: "Society" },
  { id: "sector", label: "Sector" },
  { id: "pg", label: "PG / Hostel" },
  { id: "flat", label: "Flat / Apartment" },
  { id: "locality", label: "Locality" },
];

export default function AreaPicker({ value, onChange, onAreaSelect }) {
  const { allAreas } = useCommunityData();
  const [query, setQuery] = useState(value || "");
  const [isNew, setIsNew] = useState(false);
  const [newType, setNewType] = useState("society");
  const [newSector, setNewSector] = useState("");
  const [open, setOpen] = useState(false);
  const [googleSuggestions, setGoogleSuggestions] = useState([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(true);

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
      if (value.trim()) {
        const match = allAreas.find(
          (a) => a.name.toLowerCase() === value.trim().toLowerCase()
        );
        if (match) setIsNew(false);
      }
    }
  }, [value, allAreas]);

  useEffect(() => {
    const q = query.trim();
    if (!googleEnabled || q.length < 2) {
      setGoogleSuggestions([]);
      setGoogleLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setGoogleLoading(true);
      try {
        const response = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(q)}`
        );
        const data = await response.json();

        if (response.status === 503) {
          setGoogleEnabled(false);
          setGoogleSuggestions([]);
          return;
        }

        if (response.ok) {
          setGoogleSuggestions(data.predictions || []);
        } else {
          setGoogleSuggestions([]);
        }
      } catch {
        setGoogleSuggestions([]);
      } finally {
        setGoogleLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, googleEnabled]);

  const localSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allAreas.slice(0, 6);
    return allAreas
      .filter((area) => {
        const haystack = [area.name, area.type, area.sector ? `sector ${area.sector}` : ""]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 6);
  }, [allAreas, query]);

  const mergedSuggestions = useMemo(() => {
    const seen = new Set();
    const items = [];

    for (const area of localSuggestions) {
      const key = normalizePlaceLabel(area.name);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ kind: "local", area, key: area.slug });
    }

    for (const prediction of googleSuggestions) {
      const nameKey = normalizePlaceLabel(prediction.mainText);
      const descKey = normalizePlaceLabel(prediction.description);
      if (seen.has(nameKey) || seen.has(descKey)) continue;
      seen.add(nameKey);
      seen.add(descKey);
      items.push({ kind: "google", prediction, key: prediction.placeId });
    }

    return items.slice(0, 10);
  }, [localSuggestions, googleSuggestions]);

  const exactMatch = useMemo(
    () =>
      allAreas.find((a) => a.name.toLowerCase() === query.trim().toLowerCase()),
    [allAreas, query]
  );

  const notifyNewArea = (meta) => {
    onAreaSelect?.({
      mode: "new",
      area: null,
      isNew: true,
      newAreaMeta: meta,
    });
  };

  const handleSelectExisting = (area) => {
    setQuery(area.name);
    setIsNew(false);
    setOpen(false);
    onChange(area.name);
    onAreaSelect?.({
      mode: "existing",
      area,
      isNew: false,
      newAreaMeta: null,
    });
  };

  const handleAddNew = () => {
    setIsNew(true);
    setOpen(false);
    onChange(query.trim());
    notifyNewArea({ type: newType, sector: newSector });
  };

  const handleSelectGoogle = async (prediction) => {
    const label = prediction.mainText;
    setQuery(label);
    setOpen(false);
    onChange(label);

    const localByPlace = allAreas.find((a) => a.googlePlaceId === prediction.placeId);
    if (localByPlace) {
      handleSelectExisting(localByPlace);
      return;
    }

    const localByName = allAreas.find(
      (a) => a.name.toLowerCase() === label.trim().toLowerCase()
    );
    if (localByName) {
      handleSelectExisting(localByName);
      return;
    }

    let details = null;
    try {
      const response = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(prediction.placeId)}`
      );
      if (response.ok) {
        details = await response.json();
      }
    } catch {
      // Fall back to autocomplete metadata only.
    }

    const meta = buildNewAreaMetaFromGoogle(prediction, details);
    setIsNew(true);
    setNewType(meta.type);
    setNewSector(meta.sector || "");
    notifyNewArea(meta);
  };

  const handleInputChange = (e) => {
    const next = e.target.value;
    setQuery(next);
    onChange(next);
    setOpen(true);

    const match = allAreas.find(
      (a) => a.name.toLowerCase() === next.trim().toLowerCase()
    );

    if (match) {
      setIsNew(false);
      onAreaSelect?.({
        mode: "existing",
        area: match,
        isNew: false,
        newAreaMeta: null,
      });
    } else if (next.trim().length > 2) {
      setIsNew(true);
      notifyNewArea({ type: newType, sector: newSector });
    }
  };

  const handleTypeChange = (type) => {
    setNewType(type);
    if (isNew) {
      notifyNewArea({ type, sector: newSector });
    }
  };

  const handleSectorChange = (sector) => {
    setNewSector(sector);
    if (isNew) {
      notifyNewArea({ type: newType, sector });
    }
  };

  const showAddNew =
    query.trim().length > 2 &&
    !exactMatch &&
    !mergedSuggestions.some((item) => {
      if (item.kind === "local") {
        return item.area.name.toLowerCase() === query.trim().toLowerCase();
      }
      return item.prediction.mainText.toLowerCase() === query.trim().toLowerCase();
    });

  const showDropdown =
    open &&
    (mergedSuggestions.length > 0 || showAddNew || googleLoading);

  return (
    <div className={styles.wrapper}>
      <Label className={styles.label}>Your Area</Label>
      <div className={styles.inputWrap}>
        <MapPin className={styles.icon} aria-hidden />
        <Input
          placeholder="Search or add society, sector, PG..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className={styles.input}
        />
      </div>

      {showDropdown && (
        <ul className={styles.dropdown}>
          {mergedSuggestions.map((item) =>
            item.kind === "local" ? (
              <li key={item.key}>
                <button
                  type="button"
                  className={styles.option}
                  onMouseDown={() => handleSelectExisting(item.area)}
                >
                  <span className={styles.optionName}>{item.area.name}</span>
                  <span className={styles.optionMeta}>
                    {item.area.type}
                    {item.area.sector ? ` • Sector ${item.area.sector}` : ""}
                    {item.area.isCustom ? " • Community" : ""}
                  </span>
                </button>
              </li>
            ) : (
              <li key={item.key}>
                <button
                  type="button"
                  className={`${styles.option} ${styles.googleOption}`}
                  onMouseDown={() => handleSelectGoogle(item.prediction)}
                >
                  <span className={styles.optionName}>{item.prediction.mainText}</span>
                  <span className={styles.optionMeta}>
                    {item.prediction.secondaryText || "Gurugram"}
                    {" • "}
                    <span className={styles.googleBadge}>Google Maps</span>
                  </span>
                </button>
              </li>
            )
          )}

          {googleLoading && mergedSuggestions.length === 0 && (
            <li className={styles.loadingRow}>
              <Loader2 className={`size-4 ${styles.spinner}`} aria-hidden />
              Searching Google Maps…
            </li>
          )}

          {showAddNew && (
            <li>
              <button
                type="button"
                className={`${styles.option} ${styles.addNew}`}
                onMouseDown={handleAddNew}
              >
                <Plus className="size-4" aria-hidden />
                Add &ldquo;{query.trim()}&rdquo; as new area
              </button>
            </li>
          )}
        </ul>
      )}

      {isNew && query.trim().length > 2 && (
        <div className={styles.newFields}>
          <p className={styles.newHint}>
            New area — it will be saved for everyone in the dropdown.
          </p>
          <div className={styles.newRow}>
            <div className={styles.newField}>
              <Label className={styles.smallLabel}>Type</Label>
              <Select value={newType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Area type" />
                </SelectTrigger>
                <SelectContent>
                  {AREA_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newType !== "sector" && newType !== "locality" && (
              <div className={styles.newField}>
                <Label className={styles.smallLabel}>Sector (optional)</Label>
                <Input
                  placeholder="e.g. 56"
                  value={newSector}
                  onChange={(e) => handleSectorChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

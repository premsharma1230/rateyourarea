"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect, FormSelectItem } from "@/components/forms/FormSelect";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import { normalizeSectorId } from "@/data/gurugram-sectors";
import { parseSectorFromName } from "@/lib/client-db";
import { buildNewAreaMetaFromOsm, normalizePlaceLabel } from "@/lib/osm-geocoding";
import styles from "./AreaPicker.module.scss";

const AREA_TYPES = [
  { id: "society", label: "Society" },
  { id: "sector", label: "Sector" },
  { id: "pg", label: "PG / Hostel" },
  { id: "flat", label: "Flat / Apartment" },
  { id: "locality", label: "Locality" },
];

const TYPE_DETAIL_FIELDS = {
  society: {
    label: "Society name",
    placeholder: "e.g. DLF Phase 5",
    optional: true,
  },
  sector: {
    label: "Sector",
    placeholder: "e.g. 56",
    optional: false,
  },
  pg: {
    label: "PG / Hostel name",
    placeholder: "e.g. Zolo Stays Sector 56",
    optional: true,
  },
  flat: {
    label: "Flat / Apartment name",
    placeholder: "e.g. Emaar Palm Drive",
    optional: true,
  },
  locality: {
    label: "Locality name",
    placeholder: "e.g. Golf Course Road",
    optional: false,
  },
};

function resolveNewAreaName(type, detail, query) {
  const trimmedDetail = detail.trim();
  const trimmedQuery = query.trim();

  if (type === "sector") {
    const raw = trimmedDetail || trimmedQuery;
    const sectorId =
      parseSectorFromName(raw) ||
      (/^\d+[a-z]*$/i.test(raw) ? normalizeSectorId(raw) : null);
    return sectorId ? `Sector ${sectorId}` : raw;
  }

  return trimmedDetail || trimmedQuery;
}

function resolveSectorForMeta(type, detail, query, name) {
  if (type === "sector") {
    return (
      parseSectorFromName(detail) ||
      parseSectorFromName(query) ||
      parseSectorFromName(name) ||
      null
    );
  }
  return parseSectorFromName(name) || parseSectorFromName(detail) || null;
}

function buildNewAreaMetaPayload(type, detail, query) {
  const name = resolveNewAreaName(type, detail, query);
  return {
    type,
    sector: resolveSectorForMeta(type, detail, query, name),
  };
}

const EMPTY_SELECTION = {
  mode: null,
  area: null,
  isNew: false,
  newAreaMeta: null,
};

export default function AreaPicker({
  value,
  onChange,
  onAreaSelect,
  hideLabel = false,
}) {
  const { allAreas } = useCommunityData();
  const [query, setQuery] = useState(value || "");
  const [isCommitted, setIsCommitted] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [newType, setNewType] = useState("society");
  const [newDetail, setNewDetail] = useState("");
  const [open, setOpen] = useState(false);
  const [osmSuggestions, setOsmSuggestions] = useState([]);
  const [osmLoading, setOsmLoading] = useState(false);
  const isCommittedRef = useRef(false);

  const setCommitted = (committed) => {
    isCommittedRef.current = committed;
    setIsCommitted(committed);
  };

  useEffect(() => {
    if (value === undefined) return;
    setQuery(value);
    if (!value.trim()) {
      setCommitted(false);
      setIsNew(false);
      setNewDetail("");
      return;
    }
    const match = allAreas.find(
      (a) => a.name.toLowerCase() === value.trim().toLowerCase()
    );
    if (match) {
      setCommitted(true);
      setIsNew(false);
    }
  }, [value, allAreas]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setOsmSuggestions([]);
      setOsmLoading(false);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setOsmLoading(true);
      try {
        const response = await fetch(
          `/api/geocode/search?input=${encodeURIComponent(q)}`
        );
        const data = await response.json();
        if (response.ok) {
          setOsmSuggestions(data.predictions || []);
        } else {
          setOsmSuggestions([]);
        }
      } catch {
        setOsmSuggestions([]);
      } finally {
        setOsmLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

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

    for (const prediction of osmSuggestions) {
      const nameKey = normalizePlaceLabel(prediction.mainText);
      const descKey = normalizePlaceLabel(prediction.description);
      if (seen.has(nameKey) || seen.has(descKey)) continue;
      seen.add(nameKey);
      seen.add(descKey);
      items.push({ kind: "osm", prediction, key: prediction.placeId });
    }

    return items.slice(0, 10);
  }, [localSuggestions, osmSuggestions]);

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

  const resetSelection = () => {
    setCommitted(false);
    setIsNew(false);
    setNewDetail("");
    onAreaSelect?.(EMPTY_SELECTION);
  };

  const commitAsNewArea = (type = newType, detail = newDetail, q = query) => {
    setIsNew(true);
    setCommitted(true);
    setOpen(false);
    const name = resolveNewAreaName(type, detail, q);
    onChange(name);
    notifyNewArea(buildNewAreaMetaPayload(type, detail, q));
  };

  const handleSelectExisting = (area) => {
    setQuery(area.name);
    setIsNew(false);
    setCommitted(true);
    setNewDetail("");
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
    commitAsNewArea();
  };

  const handleSelectOsm = async (prediction) => {
    const label = prediction.mainText;
    setQuery(label);
    setOpen(false);
    onChange(label);

    const localByPlace = allAreas.find(
      (a) => a.osmPlaceId === prediction.placeId || a.googlePlaceId === prediction.placeId
    );
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
        `/api/geocode/details?placeId=${encodeURIComponent(prediction.placeId)}`
      );
      if (response.ok) {
        details = await response.json();
      }
    } catch {
      // Fall back to search metadata only.
    }

    const meta = buildNewAreaMetaFromOsm(prediction, details);
    setIsNew(true);
    setCommitted(true);
    setNewType(meta.type);
    const detail =
      meta.type === "sector"
        ? meta.sector || parseSectorFromName(label) || ""
        : label;
    setNewDetail(detail);
    onChange(resolveNewAreaName(meta.type, detail, label));
    notifyNewArea(meta);
  };

  const handleInputChange = (e) => {
    const next = e.target.value;
    setQuery(next);
    onChange(next);
    setOpen(true);
    setCommitted(false);
    setIsNew(false);
    setNewDetail("");

    if (!next.trim()) {
      resetSelection();
      return;
    }

    onAreaSelect?.(EMPTY_SELECTION);
  };

  const handleTypeChange = (type) => {
    setNewType(type);
    if (isCommitted && isNew) {
      const name = resolveNewAreaName(type, newDetail, query);
      onChange(name);
      notifyNewArea(buildNewAreaMetaPayload(type, newDetail, query));
    }
  };

  const handleDetailChange = (detail) => {
    setNewDetail(detail);
    if (isCommitted && isNew) {
      const name = resolveNewAreaName(newType, detail, query);
      onChange(name);
      notifyNewArea(buildNewAreaMetaPayload(newType, detail, query));
    }
  };

  const handleBlur = () => {
    const q = query.trim();
    const hasSuggestions =
      localSuggestions.length > 0 || osmSuggestions.length > 0;
    const loading = osmLoading;

    setTimeout(() => {
      setOpen(false);

      if (isCommittedRef.current) return;
      if (q.length <= 2) return;

      const match = allAreas.find(
        (a) => a.name.toLowerCase() === q.toLowerCase()
      );
      if (match) {
        handleSelectExisting(match);
        return;
      }

      if (!hasSuggestions && !loading) {
        commitAsNewArea(newType, newDetail, q);
      }
    }, 150);
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
    (mergedSuggestions.length > 0 || showAddNew || osmLoading);

  const showNewAreaPanel = isCommitted && isNew && !open;

  return (
    <div className={styles.wrapper}>
      {!hideLabel ? (
        <Label className={styles.label}>Your Area</Label>
      ) : null}
      <div className={styles.inputWrap}>
        <MapPin className={styles.icon} aria-hidden />
        <Input
          placeholder="Search or add society, sector, PG..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
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
                  className={`${styles.option} ${styles.osmOption}`}
                  onMouseDown={() => handleSelectOsm(item.prediction)}
                >
                  <span className={styles.optionName}>{item.prediction.mainText}</span>
                  <span className={styles.optionMeta}>
                    {item.prediction.secondaryText || "Gurugram"}
                    {" • "}
                    <span className={styles.osmBadge}>OpenStreetMap</span>
                  </span>
                </button>
              </li>
            )
          )}

          {osmLoading && mergedSuggestions.length === 0 && (
            <li className={styles.loadingRow}>
              <Loader2 className={`size-4 ${styles.spinner}`} aria-hidden />
              Searching OpenStreetMap…
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

      {showNewAreaPanel && (
        <div className={styles.newFields}>
          <p className={styles.newHint}>
            New area — it will be saved for everyone in the dropdown.
          </p>
          <div className={styles.newRow}>
            <div className={styles.newField}>
              <Label className={styles.smallLabel}>Type</Label>
              <FormSelect
                value={newType}
                onValueChange={handleTypeChange}
                placeholder="Area type"
              >
                {AREA_TYPES.map((t) => (
                  <FormSelectItem key={t.id} value={t.id}>
                    {t.label}
                  </FormSelectItem>
                ))}
              </FormSelect>
            </div>
            <div className={styles.newField}>
              <Label className={styles.smallLabel}>
                {TYPE_DETAIL_FIELDS[newType].label}
                {TYPE_DETAIL_FIELDS[newType].optional ? " (optional)" : ""}
              </Label>
              <Input
                placeholder={TYPE_DETAIL_FIELDS[newType].placeholder}
                value={newDetail}
                onChange={(e) => handleDetailChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

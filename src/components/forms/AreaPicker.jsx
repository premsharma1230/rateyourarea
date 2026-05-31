"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Plus } from "lucide-react";

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

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allAreas.slice(0, 8);
    return allAreas
      .filter((area) => {
        const haystack = [area.name, area.type, area.sector ? `sector ${area.sector}` : ""]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 8);
  }, [allAreas, query]);

  const exactMatch = useMemo(
    () =>
      allAreas.find((a) => a.name.toLowerCase() === query.trim().toLowerCase()),
    [allAreas, query]
  );

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
    onAreaSelect?.({
      mode: "new",
      area: null,
      isNew: true,
      newAreaMeta: { type: newType, sector: newSector },
    });
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
      onAreaSelect?.({
        mode: "new",
        area: null,
        isNew: true,
        newAreaMeta: { type: newType, sector: newSector },
      });
    }
  };

  const handleTypeChange = (type) => {
    setNewType(type);
    if (isNew) {
      onAreaSelect?.({
        mode: "new",
        area: null,
        isNew: true,
        newAreaMeta: { type, sector: newSector },
      });
    }
  };

  const handleSectorChange = (sector) => {
    setNewSector(sector);
    if (isNew) {
      onAreaSelect?.({
        mode: "new",
        area: null,
        isNew: true,
        newAreaMeta: { type: newType, sector },
      });
    }
  };

  const showAddNew =
    query.trim().length > 2 && !exactMatch && !suggestions.some(
      (s) => s.name.toLowerCase() === query.trim().toLowerCase()
    );

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

      {open && (suggestions.length > 0 || showAddNew) && (
        <ul className={styles.dropdown}>
          {suggestions.map((area) => (
            <li key={area.slug}>
              <button
                type="button"
                className={styles.option}
                onMouseDown={() => handleSelectExisting(area)}
              >
                <span className={styles.optionName}>{area.name}</span>
                <span className={styles.optionMeta}>
                  {area.type}
                  {area.sector ? ` • Sector ${area.sector}` : ""}
                  {area.isCustom ? " • New" : ""}
                </span>
              </button>
            </li>
          ))}
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

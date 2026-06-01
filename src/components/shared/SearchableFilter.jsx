"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import styles from "./SearchableFilter.module.scss";

export default function SearchableFilter({
  label,
  value = "",
  onChange,
  options = [],
  placeholder = "Type or select…",
  allLabel = "All",
  allowCustom = true,
  disabled = false,
  optionLimit = 12,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  useEffect(() => {
    if (!open) {
      setQuery(selectedOption?.label || (value && allowCustom ? value : ""));
    }
  }, [open, selectedOption, value, allowCustom]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? options.filter((option) => {
          const haystack = [option.label, option.meta, option.value]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
      : options;

    return optionLimit > 0 ? base.slice(0, optionLimit) : base;
  }, [options, query, optionLimit]);

  const showCustom =
    allowCustom &&
    query.trim().length > 0 &&
    !filteredOptions.some(
      (option) => option.label.toLowerCase() === query.trim().toLowerCase()
    );

  const commitValue = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  const handleSelect = (optionValue) => {
    commitValue(optionValue);
  };

  const handleCustom = () => {
    commitValue(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    commitValue("");
  };

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const displayValue =
    open ? query : selectedOption?.label || (value && allowCustom ? value : allLabel);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.control}>
        <Input
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && showCustom) {
              event.preventDefault();
              handleCustom();
            }
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className={styles.input}
        />
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label={`Clear ${label}`}
          tabIndex={-1}
        >
          ×
        </button>
        <ChevronDown className={styles.chevron} aria-hidden />
      </div>

      {open && !disabled && (filteredOptions.length > 0 || showCustom || value) && (
        <ul className={styles.dropdown}>
          <li>
            <button type="button" className={styles.option} onMouseDown={handleClear}>
              {allLabel}
            </button>
          </li>
          {filteredOptions.map((option, index) => (
            <li key={option.key ?? `${option.value}-${index}`}>
              <button
                type="button"
                className={`${styles.option} ${value === option.value ? styles.active : ""}`}
                onMouseDown={() => handleSelect(option.value)}
              >
                <span className={styles.optionLabel}>{option.label}</span>
                {option.meta && <span className={styles.optionMeta}>{option.meta}</span>}
              </button>
            </li>
          ))}
          {showCustom && (
            <li>
              <button type="button" className={styles.customOption} onMouseDown={handleCustom}>
                Use &ldquo;{query.trim()}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

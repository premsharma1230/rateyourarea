"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { getExploreSearchUrl } from "@/lib/explore-search";
import styles from "./SearchBar.module.scss";

export default function SearchBar({
  placeholder = "Search area, city...",
  className = "",
  size = "default",
  value: controlledValue,
  onChange,
  submitToExplore = false,
  onSearch,
}) {
  const router = useRouter();
  const [internalValue, setInternalValue] = useState("");

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e) => {
    if (onChange) onChange(e);
    else setInternalValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    onSearch?.(q);
    if (submitToExplore) {
      router.push(getExploreSearchUrl(q));
    }
  };

  const input = (
    <div className={`${styles.search} ${styles[size]}`}>
      <Search className={styles.icon} aria-hidden />
      <input
        type="search"
        placeholder={placeholder}
        className={styles.input}
        aria-label="Search areas"
        value={value}
        onChange={handleChange}
      />
    </div>
  );

  if (submitToExplore) {
    return (
      <form onSubmit={handleSubmit} className={className}>
        {input}
      </form>
    );
  }

  return <div className={className}>{input}</div>;
}

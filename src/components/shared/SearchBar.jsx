"use client";

import { Search } from "lucide-react";

import styles from "./SearchBar.module.scss";

export default function SearchBar({
  placeholder = "Search area, city...",
  className = "",
  size = "default",
  value,
  onChange,
}) {
  return (
    <div className={`${styles.search} ${styles[size]} ${className}`}>
      <Search className={styles.icon} aria-hidden />
      <input
        type="search"
        placeholder={placeholder}
        className={styles.input}
        aria-label="Search areas"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

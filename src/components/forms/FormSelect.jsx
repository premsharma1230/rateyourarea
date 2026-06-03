"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styles from "./FormSelect.module.scss";

export function FormSelect({ value, onValueChange, placeholder, children }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={styles.trigger}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={styles.content}
        sideOffset={8}
        alignItemWithTrigger={false}
      >
        {children}
      </SelectContent>
    </Select>
  );
}

export function FormSelectItem({ value, children }) {
  return (
    <SelectItem className={styles.item} value={value}>
      {children}
    </SelectItem>
  );
}

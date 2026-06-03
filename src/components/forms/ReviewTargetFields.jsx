"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSelect, FormSelectItem } from "@/components/forms/FormSelect";
import {
  REVIEW_TARGET_DETAIL_FIELDS,
  REVIEW_TARGET_TYPES,
  normalizeReviewTargetType,
} from "@/lib/review-target";
import styles from "./ReviewTargetFields.module.scss";

export default function ReviewTargetFields({ type, name, onTypeChange, onNameChange }) {
  const normalizedType = normalizeReviewTargetType(type);
  const field = REVIEW_TARGET_DETAIL_FIELDS[normalizedType];

  return (
    <div className={styles.wrapper}>
      <p className={styles.heading}>What are you reviewing?</p>
      <p className={styles.hint}>
        The area above is the broader location — specify the society, sector, flat, or
        other place your review is about.
      </p>
      <div className={styles.row}>
        <div className={styles.field}>
          <Label className={styles.smallLabel}>Type</Label>
          <FormSelect
            value={normalizedType}
            onValueChange={onTypeChange}
            placeholder="Review type"
          >
            {REVIEW_TARGET_TYPES.map((t) => (
              <FormSelectItem key={t.id} value={t.id}>
                {t.label}
              </FormSelectItem>
            ))}
          </FormSelect>
        </div>
        <div className={styles.field}>
          <Label className={styles.smallLabel}>{field.label}</Label>
          <Input
            placeholder={field.placeholder}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

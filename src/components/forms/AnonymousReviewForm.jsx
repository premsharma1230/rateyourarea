"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

import AreaPicker from "@/components/forms/AreaPicker";
import ReviewTargetFields from "@/components/forms/ReviewTargetFields";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatReviewTargetLabel,
  getDefaultReviewTargetType,
  isValidReviewTarget,
} from "@/lib/review-target";
import styles from "./AnonymousReviewForm.module.scss";

const RATING_FIELDS = [
  { key: "overall", label: "Overall" },
  { key: "water", label: "Water" },
  { key: "power", label: "Power" },
  { key: "security", label: "Security" },
  { key: "maintenance", label: "Maintenance" },
  { key: "internet", label: "Internet" },
  { key: "parking", label: "Parking" },
  { key: "schools", label: "Schools" },
  { key: "builderTrust", label: "Builder Trust" },
];

const RATING_TEXT = ["", "Poor", "Average", "Good", "Very Good", "Excellent"];

const ISSUES = [
  "Water supply issues",
  "Power cuts",
  "Security concerns",
  "Parking problems",
  "Noise pollution",
  "Maintenance delays",
];

function StarRating({ value, onChange }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.starBtn} ${n <= value ? styles.filled : ""}`}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} stars`}
        >
          <Star className="size-5" fill={n <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

export default function AnonymousReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, user } = useAuth();
  const { submitReview, getAreaBySlug, ready } = useCommunityData();
  const { showToast } = useToast();
  const preselectedSlug = searchParams.get("area");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [areaSelection, setAreaSelection] = useState({
    mode: "existing",
    area: null,
    isNew: false,
    newAreaMeta: { type: "society", sector: "" },
  });
  const [form, setForm] = useState({
    area: "",
    reviewTargetType: "society",
    reviewTargetName: "",
    pincode: "",
    residentType: "",
    duration: "",
    ratings: Object.fromEntries(RATING_FIELDS.map((f) => [f.key, 0])),
    pros: "",
    cons: "",
    issues: [],
    recommend: null,
  });

  useEffect(() => {
    if (!ready || !preselectedSlug) return;

    const area = getAreaBySlug(preselectedSlug);
    if (!area) return;

    const selection = {
      mode: "existing",
      area,
      isNew: false,
      newAreaMeta: null,
    };
    setAreaSelection(selection);
    setForm((f) => ({
      ...f,
      area: area.name,
      reviewTargetType: getDefaultReviewTargetType(selection),
      reviewTargetName: "",
    }));
  }, [ready, preselectedSlug, getAreaBySlug]);

  const areaConfirmed =
    form.area.trim().length > 0 &&
    (areaSelection.area || areaSelection.isNew);

  const areaSelectionKey =
    areaSelection.area?.slug ??
    (areaSelection.isNew ? `new:${form.area.trim().toLowerCase()}` : "");

  useEffect(() => {
    if (!areaSelectionKey) return;

    setForm((f) => ({
      ...f,
      reviewTargetType: getDefaultReviewTargetType(areaSelection),
      reviewTargetName: "",
    }));
  }, [areaSelectionKey]);

  const updateRating = (key, val) => {
    setForm((f) => ({
      ...f,
      ratings: { ...f.ratings, [key]: val },
    }));
  };

  const toggleIssue = (issue) => {
    setForm((f) => ({
      ...f,
      issues: f.issues.includes(issue)
        ? f.issues.filter((i) => i !== issue)
        : [...f.issues, issue],
    }));
  };

  const canProceedStep1 =
    areaConfirmed &&
    isValidReviewTarget(form.reviewTargetType, form.reviewTargetName) &&
    form.residentType &&
    form.duration;

  const canSubmit =
    form.ratings.overall > 0 &&
    (form.pros.trim() || form.cons.trim()) &&
    form.recommend !== null;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      await submitReview({
        form,
        selectedArea: areaSelection.area,
        isNewArea: areaSelection.isNew,
        newAreaMeta: areaSelection.newAreaMeta,
      });

      showToast("Review submitted successfully");
      router.push("/");
    } catch {
      const message = "Something went wrong. Please try again.";
      setSubmitError(message);
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.banner}>
        {isLoggedIn
          ? "Posting as your account — review linked to you"
          : "🔒 100% Anonymous — No account needed"}
      </div>
      {submitError ? (
        <p className="text-sm text-destructive text-center mb-2" role="alert">
          {submitError}
        </p>
      ) : null}
      <div className={styles.card}>
        <div className={styles.progress}>
          {[1, 2, 3].map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={`${styles.progressDot} ${step >= s ? styles.active : ""}`}
              >
                {s}
              </span>
              {i < 2 && <span className={styles.progressLine} />}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <div className={styles.field}>
                <AreaPicker
                  value={form.area}
                  onChange={(area) => setForm({ ...form, area })}
                  onAreaSelect={setAreaSelection}
                />
              </div>
              {areaConfirmed ? (
                <div className={styles.field}>
                  <ReviewTargetFields
                    type={form.reviewTargetType}
                    name={form.reviewTargetName}
                    onTypeChange={(reviewTargetType) =>
                      setForm({ ...form, reviewTargetType })
                    }
                    onNameChange={(reviewTargetName) =>
                      setForm({ ...form, reviewTargetName })
                    }
                  />
                </div>
              ) : null}
              <div className={styles.field}>
                <Label className={styles.label}>Pincode</Label>
                <Input
                  placeholder="122001"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value })
                  }
                />
              </div>
              <div className={styles.field}>
                <Label className={styles.label}>Resident type</Label>
                <Select
                  value={form.residentType}
                  onValueChange={(v) =>
                    setForm({ ...form, residentType: v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="former">Former Resident</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className={styles.field}>
                <Label className={styles.label}>Duration lived</Label>
                <Select
                  value={form.duration}
                  onValueChange={(v) => setForm({ ...form, duration: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="How long?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-1">Less than 1 year</SelectItem>
                    <SelectItem value="1-2">1–2 years</SelectItem>
                    <SelectItem value="2-5">2–5 years</SelectItem>
                    <SelectItem value="5+">5+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
              >
                Next →
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <h3 className="text-lg font-bold mb-4">Rate Your Area</h3>
              {RATING_FIELDS.map((field) => (
                <div key={field.key} className={styles.ratingRow}>
                  <span className={styles.label}>{field.label}</span>
                  <StarRating
                    value={form.ratings[field.key]}
                    onChange={(v) => updateRating(field.key, v)}
                  />
                  <span className={styles.ratingLabel}>
                    {RATING_TEXT[form.ratings[field.key]] || "—"}
                  </span>
                </div>
              ))}
              <div className={styles.navBtns}>
                <Button
                  variant="outline"
                  className={styles.navBtn}
                  onClick={() => setStep(1)}
                >
                  ← Back
                </Button>
                <Button
                  className={styles.navBtn}
                  disabled={form.ratings.overall === 0}
                  onClick={() => setStep(3)}
                >
                  Next →
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <div className={styles.field}>
                <Label className={styles.label}>Pros</Label>
                <Textarea
                  className={styles.textareaPros}
                  placeholder="What do you love about this area?"
                  value={form.pros}
                  onChange={(e) =>
                    setForm({ ...form, pros: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className={styles.field}>
                <Label className={styles.label}>Cons</Label>
                <Textarea
                  className={styles.textareaCons}
                  placeholder="What could be better?"
                  value={form.cons}
                  onChange={(e) =>
                    setForm({ ...form, cons: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <Label className={styles.label}>Common issues</Label>
              <div className={styles.checkGroup}>
                {ISSUES.map((issue) => (
                  <label key={issue} className={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={form.issues.includes(issue)}
                      onChange={() => toggleIssue(issue)}
                    />
                    {issue}
                  </label>
                ))}
              </div>
              <Label className={styles.label}>Would you recommend?</Label>
              <div className={styles.toggleRow}>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${form.recommend === true ? styles.selected : ""}`}
                  onClick={() => setForm({ ...form, recommend: true })}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`${styles.toggleBtn} ${form.recommend === false ? styles.selected : ""}`}
                  onClick={() => setForm({ ...form, recommend: false })}
                >
                  No
                </button>
              </div>
              <div className={styles.preview}>
                Will appear as:{" "}
                <strong>
                  {isLoggedIn && user?.name
                    ? user.name
                    : "Anonymous Resident"}
                </strong>{" "}
                • {form.area || "Your Area"}
                {isValidReviewTarget(form.reviewTargetType, form.reviewTargetName)
                  ? ` • ${formatReviewTargetLabel(form.reviewTargetType, form.reviewTargetName)}`
                  : ""}{" "}
                • {form.duration || "Duration"}
              </div>
              <div className={styles.navBtns}>
                <Button
                  variant="outline"
                  className={styles.navBtn}
                  onClick={() => setStep(2)}
                >
                  ← Back
                </Button>
                <button
                  type="button"
                  className={styles.submitBtn}
                  disabled={!canSubmit || submitting}
                  onClick={handleSubmit}
                >
                  {submitting
                    ? "Submitting…"
                    : isLoggedIn
                      ? "Submit Review"
                      : "🔒 Submit Anonymously"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

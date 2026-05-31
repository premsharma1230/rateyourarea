"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";

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
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    area: "",
    pincode: "",
    residentType: "",
    duration: "",
    ratings: Object.fromEntries(RATING_FIELDS.map((f) => [f.key, 0])),
    pros: "",
    cons: "",
    issues: [],
    recommend: null,
  });

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

  if (submitted) {
    return (
      <motion.div
        className={styles.success}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CheckCircle className={`${styles.successIcon} text-primary mx-auto`} />
        <h2 className="text-2xl font-bold mb-2">Review Submitted!</h2>
        <p className="text-muted-foreground">
          Thank you for helping the community. Your review is anonymous and will
          appear shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.banner}>🔒 100% Anonymous — No account needed</div>
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
                <Label className={styles.label}>Your Area</Label>
                <Input
                  placeholder="Search society, sector, or locality..."
                  value={form.area}
                  onChange={(e) =>
                    setForm({ ...form, area: e.target.value })
                  }
                />
              </div>
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
              <Button className="w-full" onClick={() => setStep(2)}>
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
                <Button className={styles.navBtn} onClick={() => setStep(3)}>
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
                Will appear as: <strong>Anonymous Resident</strong> •{" "}
                {form.area || "Your Area"} • Since 2022
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
                  onClick={() => setSubmitted(true)}
                >
                  🔒 Submit Anonymously
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

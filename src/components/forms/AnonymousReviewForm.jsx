"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShieldCheck,
  ArrowRight,
  EyeOff,
  Scale,
  Users,
  ThumbsUp,
  ThumbsDown,
  Lock,
  ImagePlus,
  X,
} from "lucide-react";

import AreaPicker from "@/components/forms/AreaPicker";
import ReviewTargetFields from "@/components/forms/ReviewTargetFields";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCommunityData } from "@/components/providers/CommunityDataProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect, FormSelectItem } from "@/components/forms/FormSelect";
import {
  getDefaultReviewTargetType,
} from "@/lib/review-target";
import { sanitizePincodeInput } from "@/lib/utils";
import {
  uploadReviewPhoto,
  validateReviewPhotoFile,
} from "@/lib/upload-review-photo";
import styles from "./AnonymousReviewForm.module.scss";

const RATING_CATEGORY_FIELDS = [
  { key: "water", label: "Water Supply", desc: "Consistency and quality" },
  { key: "power", label: "Power Stability", desc: "Outages and surge issues" },
  { key: "security", label: "Area Security", desc: "Safety and surveillance" },
  { key: "maintenance", label: "Maintenance", desc: "Repairs and cleanliness" },
  { key: "internet", label: "Internet/Comm", desc: "Speed and signal strength" },
  { key: "parking", label: "Parking Space", desc: "Availability and cost" },
  { key: "schools", label: "Schools", desc: "Proximity and reputation" },
  { key: "builderTrust", label: "Builder Trust", desc: "Integrity and support" },
];

const RATING_KEYS = ["overall", ...RATING_CATEGORY_FIELDS.map((f) => f.key)];

const RATING_TEXT = ["", "Poor", "Average", "Good", "Great", "Excellent"];

const STEP_PROGRESS = [
  { id: 1, num: "01", label: "Area" },
  { id: 2, num: "02", label: "Ratings" },
  { id: 3, num: "03", label: "Your Review" },
];

const STEP_COPY = {
  1: {
    title: "Tell us about the locality",
    desc: "Help others find their perfect home by sharing your authentic experience.",
  },
  2: {
    title: "Performance Ratings",
    desc: "Quantify the infrastructure and quality of services in your area.",
  },
  3: {
    title: "Tell others the truth",
    desc: "Help your community with an honest, unbiased perspective.",
  },
};

const FEATURES = [
  {
    icon: EyeOff,
    title: "Incognito Review",
    desc: "No name or email required to post.",
  },
  {
    icon: Scale,
    title: "Moderated Insights",
    desc: "All reviews are verified for quality.",
  },
  {
    icon: Users,
    title: "Community First",
    desc: "Help residents every month.",
  },
];

function StarRating({ value, onChange, className, size = "md" }) {
  const iconClass =
    size === "lg"
      ? styles.starIconLg
      : size === "sm"
        ? styles.starIconSm
        : styles.starIcon;

  return (
    <div className={`${styles.stars} ${className || ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.starBtn} ${n <= value ? styles.filled : ""}`}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} stars`}
        >
          <Star
            className={iconClass}
            strokeWidth={1.5}
            fill={n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewStepProgress({ currentStep }) {
  return (
    <nav className={styles.stepProgress} aria-label="Review progress">
      {STEP_PROGRESS.map((item, index) => {
        const isActive = currentStep === item.id;

        return (
          <span key={item.id} className={styles.stepProgressGroup}>
            <div
              className={`${styles.stepProgressItem} ${isActive ? styles.stepProgressItemActive : ""}`}
            >
              <span className={styles.stepProgressCircle}>{item.num}</span>
              <span className={styles.stepProgressLabel}>{item.label}</span>
            </div>
            {index < STEP_PROGRESS.length - 1 ? (
              <span className={styles.stepProgressLine} aria-hidden />
            ) : null}
          </span>
        );
      })}
    </nav>
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
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
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
    ratings: Object.fromEntries(RATING_KEYS.map((key) => [key, 0])),
    reviewText: "",
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

  const handlePhotoSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const check = validateReviewPhotoFile(file);
    if (!check.ok) {
      showToast(check.error, "error");
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      let photoUrl = null;
      if (photoFile) {
        try {
          photoUrl = await uploadReviewPhoto(photoFile);
        } catch (err) {
          const message = err?.message || "Photo upload failed";
          setSubmitError(message);
          showToast(message, "error");
          return;
        }
      }

      const areaName = form.area.trim() || "Gurugram";
      let selectedArea = areaSelection.area;
      let isNewArea = areaSelection.isNew;
      let newAreaMeta = areaSelection.newAreaMeta;

      if (!selectedArea) {
        isNewArea = true;
        newAreaMeta = newAreaMeta || {
          type: form.reviewTargetType || "locality",
          sector: "",
        };
      }

      await submitReview({
        form: { ...form, area: areaName, photoUrl },
        selectedArea,
        isNewArea,
        newAreaMeta,
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
      <div
        className={`${styles.banner} ${isLoggedIn ? styles.bannerLoggedIn : ""}`}
      >
        <ShieldCheck className={styles.bannerIcon} aria-hidden />
        {isLoggedIn
          ? "Posting as your account — review linked to you"
          : "100% Anonymous Review. No account needed."}
      </div>

      {submitError ? (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      ) : null}

      <ReviewStepProgress currentStep={step} />

      <div className={styles.card}>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.field}>
                <Label className={styles.label}>
                  Search Locality / Society / Sector
                </Label>
                <AreaPicker
                  hideLabel
                  value={form.area}
                  onChange={(area) => setForm({ ...form, area })}
                  onAreaSelect={setAreaSelection}
                />
              </div>
              {form.area.trim() ? (
                <div className={styles.reviewTargetSection}>
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
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <Label className={styles.label}>Pincode</Label>
                  <Input
                    placeholder="6-digit code"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pincode: sanitizePincodeInput(e.target.value),
                      })
                    }
                  />
                </div>
                <div className={styles.field}>
                  <Label className={styles.label}>Resident Type</Label>
                  <FormSelect
                    value={form.residentType}
                    onValueChange={(v) =>
                      setForm({ ...form, residentType: v })
                    }
                    placeholder="Select status"
                  >
                    <FormSelectItem value="owner">Home Owner</FormSelectItem>
                    <FormSelectItem value="tenant">Tenant</FormSelectItem>
                    <FormSelectItem value="former">Former Resident</FormSelectItem>
                  </FormSelect>
                </div>
              </div>
              <div className={styles.field}>
                <Label className={styles.label}>
                  How long have you lived here?
                </Label>
                <FormSelect
                  value={form.duration}
                  onValueChange={(v) => setForm({ ...form, duration: v })}
                  placeholder="Select duration"
                >
                  <FormSelectItem value="less-1">Less than 1 year</FormSelectItem>
                  <FormSelectItem value="1-2">1–2 years</FormSelectItem>
                  <FormSelectItem value="2-5">2–5 years</FormSelectItem>
                  <FormSelectItem value="5+">5+ years</FormSelectItem>
                </FormSelect>
              </div>
              <div className={styles.trustBox}>
                <ShieldCheck className={styles.trustIcon} aria-hidden />
                <p className={styles.trustText}>
                  Your privacy is our priority. This data is used only for
                  categorical accuracy and is never linked to your identity.
                </p>
              </div>
              <div className={styles.actionsEnd}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => setStep(2)}
                >
                  Next
                  <ArrowRight className={styles.primaryBtnIcon} aria-hidden />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              className={styles.stepRatings}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.ratingsHero}>
                <h2 className={styles.ratingsHeroTitle}>
                  {STEP_COPY[2].title}
                </h2>
                <p className={styles.ratingsHeroDesc}>{STEP_COPY[2].desc}</p>
              </div>

              <div className={styles.overallCard}>
                <div className={styles.overallCardBody}>
                  <span className={styles.overallEyebrow}>
                    Overall Satisfaction
                  </span>
                  <p className={styles.overallDesc}>
                    How would you rate your overall experience living here?
                  </p>
                </div>
                <div className={styles.overallCardRating}>
                  <StarRating
                    size="lg"
                    value={form.ratings.overall}
                    onChange={(v) => updateRating("overall", v)}
                  />
                  {form.ratings.overall > 0 ? (
                    <span className={styles.ratingBadge}>
                      {RATING_TEXT[form.ratings.overall]}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className={styles.ratingsGrid}>
                {RATING_CATEGORY_FIELDS.map((field) => (
                  <div key={field.key} className={styles.ratingCard}>
                    <div className={styles.ratingCardHead}>
                      <div>
                        <h4 className={styles.ratingCardTitle}>
                          {field.label}
                        </h4>
                        <p className={styles.ratingCardDesc}>{field.desc}</p>
                      </div>
                      {form.ratings[field.key] > 0 ? (
                        <span className={styles.ratingBadge}>
                          {RATING_TEXT[form.ratings[field.key]]}
                        </span>
                      ) : null}
                    </div>
                    <StarRating
                      size="sm"
                      className={styles.ratingCardStars}
                      value={form.ratings[field.key]}
                      onChange={(v) => updateRating(field.key, v)}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.formNavFooter}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => setStep(3)}
                >
                  Next
                  <ArrowRight className={styles.primaryBtnIcon} aria-hidden />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              className={styles.stepReview}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.ratingsHero}>
                <h2 className={styles.ratingsHeroTitle}>
                  {STEP_COPY[3].title}
                </h2>
                <p className={styles.ratingsHeroDesc}>{STEP_COPY[3].desc}</p>
              </div>

              <div className={styles.reviewCompose}>
                <Label className={styles.reviewComposeLabel} htmlFor="review-text">
                  Your review
                </Label>
                <Textarea
                  id="review-text"
                  className={styles.reviewTextarea}
                  placeholder="Share what living here is really like — safety, neighbors, maintenance, surprises…"
                  value={form.reviewText}
                  onChange={(e) =>
                    setForm({ ...form, reviewText: e.target.value })
                  }
                  rows={8}
                />
              </div>

              <div className={styles.photoUploadSection}>
                <p className={styles.photoUploadLabel}>
                  Add a photo <span className={styles.optionalTag}>(optional)</span>
                </p>
                {photoPreview ? (
                  <div className={styles.photoPreviewWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Preview of your upload"
                      className={styles.photoPreviewImg}
                    />
                    <button
                      type="button"
                      className={styles.photoRemoveBtn}
                      onClick={clearPhoto}
                      aria-label="Remove photo"
                    >
                      <X aria-hidden />
                    </button>
                  </div>
                ) : (
                  <label className={styles.photoDropzone}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className={styles.photoInput}
                      onChange={handlePhotoSelect}
                    />
                    <ImagePlus className={styles.photoDropIcon} aria-hidden />
                    <span className={styles.photoDropTitle}>
                      Upload building or area photo
                    </span>
                    <span className={styles.photoDropHint}>
                      JPG, PNG or WebP · max 3 MB
                    </span>
                  </label>
                )}
              </div>

              <div className={styles.recommendGrid}>
                <button
                  type="button"
                  className={`${styles.recommendCard} ${form.recommend === true ? styles.recommendCardActive : ""}`}
                  onClick={() => setForm({ ...form, recommend: true })}
                  aria-pressed={form.recommend === true}
                >
                  <span className={styles.recommendIconWrap}>
                    <ThumbsUp className={styles.recommendIcon} aria-hidden />
                  </span>
                  <span className={styles.recommendLabel}>I Recommend</span>
                </button>
                <button
                  type="button"
                  className={`${styles.recommendCard} ${form.recommend === false ? styles.recommendCardActive : ""}`}
                  onClick={() => setForm({ ...form, recommend: false })}
                  aria-pressed={form.recommend === false}
                >
                  <span
                    className={`${styles.recommendIconWrap} ${styles.recommendIconWrapMuted}`}
                  >
                    <ThumbsDown className={styles.recommendIcon} aria-hidden />
                  </span>
                  <span className={styles.recommendLabel}>I Do Not</span>
                </button>
              </div>

              <div className={styles.reviewSubmitBlock}>
                <button
                  type="button"
                  className={styles.glowSubmitBtn}
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting
                    ? "Submitting…"
                    : isLoggedIn
                      ? "Submit Review"
                      : "Submit Anonymously"}
                </button>

                <div className={styles.privacyCard}>
                  <div className={styles.privacyCardMain}>
                    <span className={styles.privacyShield}>
                      <ShieldCheck aria-hidden />
                    </span>
                    <div>
                      <p className={styles.privacyName}>
                        {isLoggedIn && user?.name
                          ? user.name
                          : "Anonymous Resident"}
                      </p>
                      <p className={styles.privacySub}>
                        Identity protected — your review stays private
                      </p>
                    </div>
                  </div>
                  <div className={styles.privacyDivider} aria-hidden />
                  <div className={styles.privacyBadges}>
                    <span>
                      <EyeOff aria-hidden />
                      No tracking
                    </span>
                    {!isLoggedIn ? (
                      <span>
                        <Lock aria-hidden />
                        No account
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className={styles.guidelines}>
                  By submitting, you agree to our Community Integrity Guidelines.
                </p>
              </div>

              <div className={styles.formNavFooter}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setStep(2)}
                >
                  ← Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.features}>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className={styles.feature}>
            <Icon className={styles.featureIcon} aria-hidden />
            <h4 className={styles.featureTitle}>{title}</h4>
            <p className={styles.featureDesc}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

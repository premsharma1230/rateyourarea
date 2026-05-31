export const REVIEW_TARGET_TYPES = [
  { id: "society", label: "Society" },
  { id: "sector", label: "Sector" },
  { id: "pg", label: "PG / Hostel" },
  { id: "flat", label: "Flat / Apartment" },
  { id: "locality", label: "Locality" },
];

export const REVIEW_TARGET_TYPE_IDS = new Set(
  REVIEW_TARGET_TYPES.map((t) => t.id)
);

export const REVIEW_TARGET_DETAIL_FIELDS = {
  society: {
    label: "Society name",
    placeholder: "e.g. DLF Phase 5",
  },
  sector: {
    label: "Sector number",
    placeholder: "e.g. 56",
  },
  pg: {
    label: "PG name",
    placeholder: "e.g. Zolo Stays Sector 56",
  },
  flat: {
    label: "Building / society name",
    placeholder: "e.g. Tower B, Palm Springs",
  },
  locality: {
    label: "Locality name",
    placeholder: "e.g. Golf Course Road",
  },
};

const REVIEW_TARGET_TYPE_LABELS = Object.fromEntries(
  REVIEW_TARGET_TYPES.map((t) => [t.id, t.label])
);

export function normalizeReviewTargetType(type) {
  if (!type) return "society";
  const normalized = String(type).toLowerCase();
  return REVIEW_TARGET_TYPE_IDS.has(normalized) ? normalized : "society";
}

export function getDefaultReviewTargetType(areaSelection) {
  if (areaSelection?.area?.type) {
    return normalizeReviewTargetType(areaSelection.area.type);
  }
  if (areaSelection?.newAreaMeta?.type) {
    return normalizeReviewTargetType(areaSelection.newAreaMeta.type);
  }
  return "society";
}

export function isValidReviewTarget(type, name) {
  const normalized = normalizeReviewTargetType(type);
  return REVIEW_TARGET_TYPE_IDS.has(normalized) && Boolean(String(name || "").trim());
}

export function formatReviewTargetLabel(type, name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return null;

  const normalized = normalizeReviewTargetType(type);
  const typeLabel = REVIEW_TARGET_TYPE_LABELS[normalized] || normalized;

  if (normalized === "sector") {
    const sectorNum = trimmed.replace(/^sector\s*/i, "");
    return `Sector ${sectorNum}`;
  }

  return `${typeLabel}: ${trimmed}`;
}

import { parseSectorFromName } from "@/lib/client-db";

export const GURUGRAM_CENTER = { lat: 28.4595, lng: 77.0266 };

export function inferAreaTypeFromGoogle(types = [], description = "") {
  const desc = description.toLowerCase();

  if (types.includes("lodging") || /pg|hostel|coliving|paying guest/i.test(desc)) {
    return "pg";
  }
  if (/sector\s*\d/i.test(desc)) {
    return "sector";
  }
  if (/apartment|flat|tower|residency|heights|condominium/i.test(desc)) {
    return "flat";
  }
  if (
    types.includes("premise") ||
    types.includes("establishment") ||
    /society|colony|enclave|vihar|nagar|phase|dlf|sobha|m3m/i.test(desc)
  ) {
    return "society";
  }
  return "locality";
}

export function parseSectorFromAddressComponents(components = []) {
  for (const component of components) {
    const text = component.long_name || component.short_name || "";
    const sector = parseSectorFromName(text);
    if (sector) return sector;
  }
  return null;
}

export function normalizePlaceLabel(text = "") {
  return text.trim().toLowerCase();
}

export function mapGooglePrediction(prediction) {
  return {
    placeId: prediction.place_id,
    description: prediction.description,
    mainText: prediction.structured_formatting?.main_text || prediction.description,
    secondaryText: prediction.structured_formatting?.secondary_text || "",
    types: prediction.types || [],
  };
}

export function buildNewAreaMetaFromGoogle(prediction, details = null) {
  const description = prediction.description || "";
  const type = inferAreaTypeFromGoogle(prediction.types, description);
  const sector =
    details?.sector ||
    parseSectorFromAddressComponents(details?.addressComponents) ||
    parseSectorFromName(description) ||
    parseSectorFromName(prediction.mainText) ||
    "";

  return {
    type,
    sector,
    googlePlaceId: prediction.placeId,
    address: details?.formattedAddress || description,
    lat: details?.lat ?? null,
    lng: details?.lng ?? null,
  };
}

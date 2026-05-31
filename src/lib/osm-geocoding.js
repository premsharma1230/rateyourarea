import { parseSectorFromName } from "@/lib/client-db";

export const GURUGRAM_CENTER = { lat: 28.4595, lng: 77.0266 };

/** Nominatim viewbox: left, top, right, bottom */
export const GURUGRAM_VIEWBOX = "76.90,28.55,77.20,28.30";

export function inferAreaTypeFromLabel(label = "", type = "") {
  const text = label.toLowerCase();

  if (/pg|hostel|coliving|paying guest/i.test(text)) return "pg";
  if (/sector\s*\d/i.test(text)) return "sector";
  if (/apartment|flat|tower|residency|heights|condominium/i.test(text)) {
    return "flat";
  }
  if (
    type === "residential" ||
    /society|colony|enclave|vihar|nagar|phase|dlf|sobha|m3m|project/i.test(text)
  ) {
    return "society";
  }
  return "locality";
}

export function mapNominatimResult(result) {
  const mainText =
    result.name ||
    result.display_name.split(",")[0]?.trim() ||
    result.display_name;

  return {
    placeId: `${result.osm_type || "node"}:${result.osm_id}`,
    description: result.display_name,
    mainText,
    secondaryText: result.display_name.replace(`${mainText},`, "").trim(),
    types: [result.type, result.class].filter(Boolean),
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
  };
}

export function buildNewAreaMetaFromOsm(prediction, details = null) {
  const description = prediction.description || "";
  const type = inferAreaTypeFromLabel(description, prediction.types?.[0]);
  const sector =
    details?.sector ||
    parseSectorFromName(description) ||
    parseSectorFromName(prediction.mainText) ||
    "";

  return {
    type,
    sector,
    osmPlaceId: prediction.placeId,
    address: details?.formattedAddress || description,
    lat: details?.lat ?? prediction.lat ?? null,
    lng: details?.lng ?? prediction.lng ?? null,
  };
}

export function normalizePlaceLabel(text = "") {
  return text.trim().toLowerCase();
}

export function buildNominatimQuery(input) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/gurugram|gurgaon/i.test(trimmed)) return trimmed;
  return `${trimmed}, Gurugram, Haryana, India`;
}

/** Clean seed names + sector-aware query for maps/geocoding */
export function buildMapSearchQuery(area) {
  if (!area) return "Gurugram, Haryana, India";

  const { name, city = "Gurugram", sector, type } = area;

  if (type === "sector") {
    const sectorId = sector || parseSectorFromName(name);
    return sectorId
      ? `Sector ${sectorId}, Gurugram, Haryana, India`
      : `${name}, Gurugram, Haryana, India`;
  }

  const cleanName = name
    .replace(
      /\s*(Residential Society|CGHS|RWA Area|RWA|Housing Board|Housing Society|Housing)\s*/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

  if (sector) {
    return `${cleanName}, Sector ${sector}, Gurugram, Haryana, India`;
  }

  return `${cleanName}, ${city}, Haryana, India`;
}

export function buildGoogleMapsUrl(area) {
  const query = buildMapSearchQuery(area);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

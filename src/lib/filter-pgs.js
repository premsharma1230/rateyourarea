import { normalizeSectorId } from "@/data/gurugram-sectors";

function matchesQuery(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    item.name,
    item.city,
    item.sector ? `sector ${item.sector}` : "",
    item.address,
    item.slug,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

function matchesPgSelection(item, param, source) {
  if (!param) return true;

  if (source.some((p) => p.slug === param)) {
    return item.slug === param;
  }

  const q = param.trim().toLowerCase();
  return item.name?.toLowerCase().includes(q) ?? false;
}

/** Filters `pg_data` rows only — not mixed with areas table */
export function filterPGListings(
  { city = "Gurugram", sector = "", pg = "", query = "" } = {},
  pgs = []
) {
  return pgs.filter((item) => {
    if (city && item.city !== city) return false;

    if (pg) {
      if (!matchesPgSelection(item, pg, pgs)) return false;
      return matchesQuery(item, query);
    }

    if (sector) {
      const itemSector = item.sector ? normalizeSectorId(item.sector) : "";
      if (itemSector && itemSector !== normalizeSectorId(sector)) {
        return false;
      }
    }

    return matchesQuery(item, query);
  });
}

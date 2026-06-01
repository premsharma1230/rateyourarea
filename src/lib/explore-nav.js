/** Labels aligned with home TopRatedSections + explore ?type= */
export const EXPLORE_TYPE_BREADCRUMBS = {
  all: { label: "Explore", title: "Explore Areas" },
  society: { label: "Societies", title: "Societies in Gurugram" },
  locality: { label: "Areas", title: "Areas in Gurugram" },
  pg: { label: "PG & Flat", title: "PG & Flat in Gurugram" },
  sector: { label: "Sectors", title: "Sectors in Gurugram" },
  flat: { label: "Flats", title: "Flats in Gurugram" },
};

export function getExploreHref(type = "all") {
  if (!type || type === "all") return "/explore";
  return `/explore?type=${type}`;
}

export function getExploreTypeMeta(type = "all") {
  return EXPLORE_TYPE_BREADCRUMBS[type] ?? EXPLORE_TYPE_BREADCRUMBS.all;
}

/** @param {string} [type] explore ?type=
 * @param {string} [currentLabel] final crumb when on detail page
 */
export function buildExploreBreadcrumbs(type = "all", currentLabel = null) {
  const items = [{ label: "Home", href: "/" }];
  const meta = getExploreTypeMeta(type);

  if (type && type !== "all") {
    items.push({ label: meta.label, href: getExploreHref(type) });
  } else if (!currentLabel) {
    items.push({ label: meta.label, href: "/explore" });
  }

  if (currentLabel) {
    items.push({ label: currentLabel });
  }

  return items;
}

export function getExplorePageTitle(type = "all") {
  return getExploreTypeMeta(type).title;
}

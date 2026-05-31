export const RATING_LABELS = {
  water: "Water Supply",
  power: "Power Backup",
  security: "Security",
  maintenance: "Maintenance",
  internet: "Internet Connectivity",
  parking: "Parking",
  schools: "Nearby Schools/Hospitals",
  builderTrust: "Builder Trust Score",
};

export function computeAggregateRatings(area, reviews) {
  const keys = Object.keys(RATING_LABELS);
  const base = area.ratings || {};

  if (!reviews.length) return base;

  const aggregated = {};

  keys.forEach((key) => {
    const values = reviews
      .map((review) => review.detailedRatings?.[key] ?? 0)
      .filter((value) => value > 0);

    aggregated[key] = values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : base[key] ?? 0;
  });

  return aggregated;
}

export function getRatingBarTone(value) {
  if (value < 3) return "low";
  if (value < 3.8) return "mid";
  return "good";
}

export function textToTags(text) {
  if (!text) return [];

  return text
    .split(/[,;•\n]|(?<=\.)\s+/)
    .map((part) => part.trim().replace(/^[-–—]\s*/, ""))
    .filter((part) => part.length > 2 && part.length <= 48)
    .slice(0, 4);
}

export function sortReviews(reviews, sortBy) {
  const list = [...reviews];

  switch (sortBy) {
    case "highest":
      return list.sort((a, b) => b.rating - a.rating);
    case "lowest":
      return list.sort((a, b) => a.rating - b.rating);
    case "recent":
      return list.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    case "relevant":
    default:
      return list.sort((a, b) => {
        if (a.isUserReview !== b.isUserReview) {
          return a.isUserReview ? -1 : 1;
        }
        return b.rating - a.rating;
      });
  }
}

export function renderStars(rating) {
  const filledCount = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) => index < filledCount);
}

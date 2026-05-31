/** Whether the review was submitted anonymously */
export function isReviewAnonymous(review) {
  if (review?.isAnonymous === true) return true;
  if (review?.isAnonymous === false) return false;
  return !review?.reviewerDisplayName;
}

/** Resolve the best display name for a review author */
export function getReviewDisplayName(review, currentUser = null) {
  const stored = review?.reviewerDisplayName?.trim();
  if (stored) return stored;

  const isOwnReview = currentUser?.id && review?.userId === currentUser.id;

  if (isOwnReview) {
    const authName = currentUser.name?.trim();
    if (authName && authName !== "Resident") return authName;
    const emailLocal = currentUser.email?.split("@")[0]?.trim();
    if (emailLocal) return emailLocal;
  }

  return null;
}

/** Resident line shown on review cards */
export function getReviewAuthorName(review, currentUser = null) {
  if (isReviewAnonymous(review)) return "Anonymous Resident";
  return getReviewDisplayName(review, currentUser) || "Resident";
}

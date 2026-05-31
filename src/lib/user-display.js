/** First name from full name or email local-part */
export function getFirstName(name, email = "") {
  const trimmed = name?.trim();
  if (trimmed) return trimmed.split(/\s+/)[0];
  if (email?.includes("@")) return email.split("@")[0];
  return "User";
}

/** First + last name initials, e.g. "Prem Sharma" → "PS" */
export function getUserInitials(name, email = "") {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email?.includes("@")) {
    return email.split("@")[0].slice(0, 2).toUpperCase();
  }
  return "U";
}

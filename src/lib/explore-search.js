export function getExploreSearchUrl(query) {
  const q = query.trim();
  return q ? `/explore?q=${encodeURIComponent(q)}` : "/explore";
}

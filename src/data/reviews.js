export const reviews = [
  {
    id: 1,
    areaSlug: "sector-56",
    areaName: "Sector 56",
    rating: 4.0,
    residentType: "tenant",
    residentSince: "2022",
    duration: "2 years",
    quote:
      "Lived here for 2 years. The accessibility to Metro is great, and the neighborhood feels very safe at night due to constant patrolling. Water supply is consistent.",
    pros: "Metro accessibility is great. Safe neighborhood at night.",
    cons: "Water TDS is high.",
    tags: [
      { label: "Safe at night", icon: "shield", variant: "primary" },
      { label: "High TDS", icon: "droplets", variant: "error" },
      { label: "Near Metro", icon: "train", variant: "primary" },
    ],
    recommended: true,
    date: "2024-01-15",
    avatarVariant: "primary",
  },
  {
    id: 2,
    areaSlug: "dlf-phase-3",
    areaName: "DLF Phase 3",
    rating: 2.5,
    residentType: "owner",
    residentSince: "2020",
    duration: "4 years",
    quote:
      "The location is convenient for offices but the noise pollution from the main road is unbearable during peak hours. Also, parking is a nightmare.",
    pros: "Close to offices and malls.",
    cons: "Noise pollution and parking issues.",
    tags: [
      { label: "High noise", icon: "volume-2", variant: "error" },
      { label: "Parking issues", icon: "car", variant: "error" },
    ],
    recommended: false,
    date: "2024-02-20",
    avatarVariant: "error",
  },
  {
    id: 3,
    areaSlug: "golf-course-road",
    areaName: "Golf Course Road",
    rating: 4.5,
    residentType: "owner",
    residentSince: "2019",
    duration: "5 years",
    quote:
      "Premium living with excellent security and power backup. Traffic during rush hour is the only real downside.",
    pros: "Premium amenities and safety.",
    cons: "Rush hour traffic.",
    tags: [
      { label: "Premium", icon: "star", variant: "primary" },
      { label: "Great security", icon: "shield", variant: "primary" },
    ],
    recommended: true,
    date: "2024-03-10",
    avatarVariant: "primary",
  },
  {
    id: 4,
    areaSlug: "sector-57",
    areaName: "Sector 57",
    rating: 3.8,
    residentType: "tenant",
    residentSince: "2023",
    duration: "1 year",
    quote:
      "Good value for money. Young crowd and active community. Water quality needs improvement.",
    pros: "Affordable and vibrant community.",
    cons: "Water quality issues.",
    tags: [
      { label: "Affordable", icon: "wallet", variant: "primary" },
      { label: "High TDS", icon: "droplets", variant: "error" },
    ],
    recommended: true,
    date: "2024-04-05",
    avatarVariant: "primary",
  },
  {
    id: 5,
    areaSlug: "cyber-city",
    areaName: "Cyber City",
    rating: 4.2,
    residentType: "tenant",
    residentSince: "2021",
    duration: "3 years",
    quote:
      "Perfect for working professionals. Walk to office, great cafes, reliable power and internet.",
    pros: "Walkable to offices, great connectivity.",
    cons: "Expensive rents.",
    tags: [
      { label: "Walk to work", icon: "footprints", variant: "primary" },
      { label: "Expensive", icon: "trending-up", variant: "error" },
    ],
    recommended: true,
    date: "2024-05-12",
    avatarVariant: "primary",
  },
  {
    id: 6,
    areaSlug: "palam-vihar",
    areaName: "Palam Vihar",
    rating: 3.2,
    residentType: "owner",
    residentSince: "2018",
    duration: "6 years",
    quote:
      "Community feel is nice but maintenance has declined. Several builder-related complaints in our block.",
    pros: "Established community, affordable.",
    cons: "Declining maintenance, builder issues.",
    tags: [
      { label: "Builder issues", icon: "alert-triangle", variant: "error" },
      { label: "Community feel", icon: "users", variant: "primary" },
    ],
    recommended: false,
    date: "2024-06-01",
    avatarVariant: "error",
  },
];

export function getReviewsByTab(tab) {
  if (tab === "highest") {
    return [...reviews].sort((a, b) => b.rating - a.rating);
  }
  return [...reviews].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

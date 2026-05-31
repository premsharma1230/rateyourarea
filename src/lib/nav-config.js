import { Home, Compass, BookOpen, User, MessageSquarePlus } from "lucide-react";

/** Main header nav — shared by desktop header, mobile bottom nav, and drawer */
export const MAIN_NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, match: ["/"] },
  {
    href: "/explore",
    label: "Explore",
    icon: Compass,
    match: ["/explore", "/area"],
  },
  { href: "/blog", label: "Blog", icon: BookOpen, match: ["/blog"], hidden: true },
];

export const PROFILE_NAV_ITEM = {
  href: "/profile",
  label: "Profile",
  icon: User,
  match: ["/profile"],
};

/** Mobile bottom nav — Add Review */
export const REVIEW_NAV_ITEM = {
  href: "/review",
  label: "Review",
  icon: MessageSquarePlus,
  match: ["/review"],
};

export const blogMenu = [
  "Area Guides",
  "Flat Buying Tips",
  "Tenant Rights India",
  "Builder News",
];

export function isNavActive(pathname, matchPaths) {
  if (matchPaths.includes("/")) {
    return pathname === "/";
  }
  return matchPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

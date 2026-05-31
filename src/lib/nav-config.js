import { Home, Compass, BookOpen, User } from "lucide-react";

/** Main header nav — shared by desktop header, mobile bottom nav, and drawer */
export const MAIN_NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, match: ["/"] },
  {
    href: "/explore",
    label: "Explore",
    icon: Compass,
    match: ["/explore", "/area"],
  },
  { href: "/blog", label: "Blog", icon: BookOpen, match: ["/blog"] },
];

export const PROFILE_NAV_ITEM = {
  href: "/profile",
  label: "Profile",
  icon: User,
  match: ["/profile"],
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";
import {
  MAIN_NAV_ITEMS,
  PROFILE_NAV_ITEM,
  isNavActive,
} from "@/lib/nav-config";
import styles from "./MobileBottomNav.module.scss";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  const items = isLoggedIn
    ? [...MAIN_NAV_ITEMS, PROFILE_NAV_ITEM]
    : MAIN_NAV_ITEMS;

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      <div className={styles.inner}>
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = isNavActive(pathname, match);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.item} ${active ? styles.active : ""}`}
            >
              <Icon className={styles.icon} aria-hidden />
              <span className={styles.label}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

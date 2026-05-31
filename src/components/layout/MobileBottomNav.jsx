"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  MAIN_NAV_ITEMS,
  REVIEW_NAV_ITEM,
  isNavActive,
} from "@/lib/nav-config";
import styles from "./MobileBottomNav.module.scss";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const items = [...MAIN_NAV_ITEMS, REVIEW_NAV_ITEM].filter(
    (item) => !item.hidden
  );

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

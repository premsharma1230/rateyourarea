import Link from "next/link";

import { cn } from "@/lib/utils";
import styles from "./Breadcrumbs.module.scss";

/**
 * @param {{ label: string, href?: string }[]} items
 * @param {"default" | "onDark"} [variant]
 */
export default function Breadcrumbs({ items, className, variant = "default" }) {
  if (!items?.length) return null;

  return (
    <nav
      className={cn(styles.root, variant === "onDark" && styles.onDark, className)}
      aria-label="Breadcrumb"
    >
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const showLink = item.href && !isLast;

          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {index > 0 ? <span className={styles.sep} aria-hidden>/</span> : null}
              {showLink ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

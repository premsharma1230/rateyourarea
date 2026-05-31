"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Plus, User } from "lucide-react";

import SearchBar from "@/components/shared/SearchBar";
import ThemeToggle from "@/components/layout/ThemeToggle";
import LoginModal from "@/components/forms/LoginModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { LOGO_URL } from "@/lib/constants";
import {
  MAIN_NAV_ITEMS,
  PROFILE_NAV_ITEM,
  blogMenu,
  isNavActive,
} from "@/lib/nav-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import styles from "./Header.module.scss";

function NavDropdown({ label, children }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={styles.navLink}>
        {label}
        <ChevronDown className={styles.chevron} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const closeDrawer = () => setMobileOpen(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <Link href="/" className={styles.logo}>
              <Image
                src={LOGO_URL}
                alt="RateYourArea — Real Residents. Real Reviews."
                width={128}
                height={128}
                className={styles.logoImg}
                priority
              />
            </Link>
            <div className={styles.searchWrap}>
              <SearchBar submitToExplore placeholder="Search area, city..." />
            </div>
          </div>

          <nav className={styles.nav}>
            {MAIN_NAV_ITEMS.map(({ href, label, match }) =>
              label === "Blog" ? (
                <NavDropdown key={href} label="Blog">
                  {blogMenu.map((item) => (
                    <DropdownMenuItem key={item} render={<Link href="/blog" />}>
                      {item}
                    </DropdownMenuItem>
                  ))}
                </NavDropdown>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.navLink} ${isNavActive(pathname, match) ? styles.active : ""}`}
                >
                  {label}
                </Link>
              )
            )}
            {isLoggedIn && (
              <Link
                href={PROFILE_NAV_ITEM.href}
                className={`${styles.navLink} ${isNavActive(pathname, PROFILE_NAV_ITEM.match) ? styles.active : ""}`}
              >
                {PROFILE_NAV_ITEM.label}
              </Link>
            )}
          </nav>

          <div className={styles.right}>
            <ThemeToggle />
            {isLoggedIn ? (
              <Link href="/profile" className={styles.profileBtn}>
                <User className="size-4" aria-hidden />
                <span className={styles.profileLabel}>Profile</span>
              </Link>
            ) : (
              <button
                type="button"
                className={styles.loginBtn}
                onClick={() => setLoginOpen(true)}
              >
                Login
              </button>
            )}
            <Link href="/review" className={styles.addReviewBtn}>
              <Plus className={styles.addReviewIcon} aria-hidden />
              <span className={styles.addReviewLabelFull}>Add Review</span>
              <span className={styles.addReviewLabelShort}>Review</span>
            </Link>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </div>
      </header>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.drawerOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />
            <motion.aside
              className={styles.drawer}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                type="button"
                className={styles.drawerCloseBtn}
                onClick={closeDrawer}
                aria-label="Close menu"
              >
                <X className="size-6" />
              </button>
              <SearchBar
                className="mt-6"
                submitToExplore
                placeholder="Search area, city..."
                onSearch={closeDrawer}
              />
              <nav className={styles.drawerNav}>
                {MAIN_NAV_ITEMS.map(({ href, label, match }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`${styles.drawerLink} ${isNavActive(pathname, match) ? styles.drawerLinkActive : ""}`}
                    onClick={closeDrawer}
                  >
                    {label}
                  </Link>
                ))}
                {isLoggedIn ? (
                  <Link
                    href={PROFILE_NAV_ITEM.href}
                    className={`${styles.drawerLink} ${isNavActive(pathname, PROFILE_NAV_ITEM.match) ? styles.drawerLinkActive : ""}`}
                    onClick={closeDrawer}
                  >
                    {PROFILE_NAV_ITEM.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={styles.drawerLink}
                    onClick={() => {
                      closeDrawer();
                      setLoginOpen(true);
                    }}
                  >
                    Login
                  </button>
                )}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

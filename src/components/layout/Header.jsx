"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Plus } from "lucide-react";

import SearchBar from "@/components/shared/SearchBar";
import ThemeToggle from "@/components/layout/ThemeToggle";
import LoginModal from "@/components/forms/LoginModal";
import { LOGO_URL } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import styles from "./Header.module.scss";

const exploreMenu = {
  cities: ["Gurugram", "Delhi", "Noida", "Bangalore", "Mumbai"],
  types: ["Societies", "Sectors", "PG/Hostels", "Builders"],
};

const topRatedMenu = [
  "Top Societies",
  "Top Sectors",
  "Top PGs",
  "Best Builders 🏆",
];

const worstRatedMenu = [
  "Worst Societies",
  "Most Complained",
  "Builder Blacklist ⚠️",
  "RERA Tracker",
];

const blogMenu = [
  "Area Guides",
  "Flat Buying Tips",
  "Tenant Rights India",
  "Builder News",
];

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const isHome = pathname === "/";

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.left}>
            <Link href="/" className={styles.logo}>
              <Image
                src={LOGO_URL}
                alt="RateYourArea"
                width={160}
                height={40}
                className={styles.logoImg}
                priority
              />
            </Link>
            <div className={styles.searchWrap}>
              <SearchBar />
            </div>
          </div>

          <nav className={styles.nav}>
            <Link
              href="/"
              className={`${styles.navLink} ${isHome ? styles.active : ""}`}
            >
              Home
            </Link>
            <NavDropdown label="Explore">
              <DropdownMenuGroup>
                <DropdownMenuLabel>By City</DropdownMenuLabel>
                {exploreMenu.cities.map((city) => (
                  <DropdownMenuItem key={city} render={<Link href="/explore" />}>
                    {city}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>By Type</DropdownMenuLabel>
                {exploreMenu.types.map((type) => (
                  <DropdownMenuItem key={type} render={<Link href="/explore" />}>
                    {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </NavDropdown>
            <NavDropdown label="Top Rated">
              {topRatedMenu.map((item) => (
                <DropdownMenuItem key={item} render={<Link href="/top-rated" />}>
                  {item}
                </DropdownMenuItem>
              ))}
            </NavDropdown>
            <NavDropdown label="Worst Rated">
              {worstRatedMenu.map((item) => (
                <DropdownMenuItem
                  key={item}
                  render={<Link href="/worst-rated" />}
                >
                  {item}
                </DropdownMenuItem>
              ))}
            </NavDropdown>
            <NavDropdown label="Blog">
              {blogMenu.map((item) => (
                <DropdownMenuItem key={item} render={<Link href="/blog" />}>
                  {item}
                </DropdownMenuItem>
              ))}
            </NavDropdown>
          </nav>

          <div className={styles.right}>
            <ThemeToggle />
            <button
              type="button"
              className={styles.loginBtn}
              onClick={() => setLoginOpen(true)}
            >
              Login
            </button>
            <Link href="/review" className={styles.addReviewBtn}>
              <Plus className="size-4 lg:hidden" aria-hidden />
              <span className="hidden sm:inline">Add Review</span>
              <span className="sm:hidden">Review</span>
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
              onClick={() => setMobileOpen(false)}
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
                className={styles.menuBtn}
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="size-6" />
              </button>
              <SearchBar className="mt-6" />
              <nav className={styles.drawerNav}>
                <Link
                  href="/"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/explore"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Explore
                </Link>
                <Link
                  href="/top-rated"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Top Rated
                </Link>
                <Link
                  href="/worst-rated"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Worst Rated
                </Link>
                <Link
                  href="/blog"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/review"
                  className={styles.drawerLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Add Review
                </Link>
                <button
                  type="button"
                  className={styles.drawerLink}
                  onClick={() => {
                    setMobileOpen(false);
                    setLoginOpen(true);
                  }}
                >
                  Login
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

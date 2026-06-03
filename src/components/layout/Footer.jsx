import Image from "next/image";
import Link from "next/link";
import { Globe, Share2, AtSign, Lock, BadgeCheck } from "lucide-react";

import { LOGO_URL } from "@/lib/constants";
import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logoWrap}>
              <Image
                src={LOGO_URL}
                alt="RateYourArea — Real Residents. Real Reviews."
                width={128}
                height={128}
                className={styles.logoImg}
              />
            </div>
            <p className={styles.tagline}>
              The definitive intelligence platform for real estate, powered by
              community integrity and data accuracy.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink} aria-label="Website">
                <Globe className="size-6" />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Share">
                <Share2 className="size-6" />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Email">
                <AtSign className="size-6" />
              </a>
            </div>
          </div>

          <div className={styles.column}>
            <h5 className={`${styles.heading} ${styles.platform}`}>Platform</h5>
            <ul className={styles.links}>
              <li>
                <Link href="#" className={styles.link}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/explore" className={styles.link}>
                  Explore Areas
                </Link>
              </li>
              <li>
                <Link href="#" className={styles.link}>
                  Recent Reviews
                </Link>
              </li>
              <li>
                <Link href="#" className={styles.link}>
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h5 className={`${styles.heading} ${styles.legal}`}>Legal</h5>
            <ul className={styles.links}>
              <li>
                <Link href="#" className={styles.link}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className={styles.link}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className={styles.link}>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.columnWide}>
            <h5 className={`${styles.heading} ${styles.newsletter}`}>
              Stay Informed
            </h5>
            <p className={styles.newsletterText}>
            Get alerts when a new review is posted for your society or area.
            </p>
            <form className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Email address"
                className={styles.emailInput}
                aria-label="Email address"
              />
              <button type="submit" className={styles.joinBtn}>
                Join
              </button>
            </form>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 RateYourArea. Real Residents. Real Reviews. ❄️
          </p>
          <div className={styles.badges}>
            <span className={styles.trustBadge}>
              <Lock className={styles.trustIcon} aria-hidden />
              Secure Encryption
            </span>
            <span className={styles.trustBadge}>
              <BadgeCheck className={styles.trustIcon} aria-hidden />
              Privacy Guaranteed
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

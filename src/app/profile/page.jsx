"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Star, MapPin } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import styles from "./page.module.scss";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, ready } = useAuth();

  if (!ready) {
    return <div className={styles.page} aria-busy="true" />;
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.subtitle}>Login to view your profile and saved activity.</p>
          <Button render={<Link href="/" />} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.avatar}>
          <User className="size-8" aria-hidden />
        </div>
        <h1 className={styles.title}>{user.name}</h1>
        <p className={styles.email}>{user.email}</p>

        <div className={styles.actions}>
          <Link href="/review" className={styles.actionLink}>
            <Star className="size-4" aria-hidden />
            Write a review
          </Link>
          <Link href="/explore" className={styles.actionLink}>
            <MapPin className="size-4" aria-hidden />
            Explore areas
          </Link>
        </div>

        <Button
          variant="outline"
          className={styles.logoutBtn}
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          <LogOut className="size-4" aria-hidden />
          Log out
        </Button>
      </div>
    </div>
  );
}

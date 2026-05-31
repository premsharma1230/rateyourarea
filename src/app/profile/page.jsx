"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Star, MapPin } from "lucide-react";

import UserInitials from "@/components/shared/UserInitials";
import { useAuth } from "@/components/providers/AuthProvider";
import { getProfile } from "@/backend/api/profiles";
import { Button } from "@/components/ui/button";
import styles from "./page.module.scss";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, logout, ready } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    let mounted = true;

    (async () => {
      setProfileLoading(true);

      const { data } = await getProfile(user.id);
      if (mounted) {
        setProfile(data);
        setProfileLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (!ready) {
    return <div className={styles.page} aria-busy="true" />;
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.subtitle}>
            Login to view your profile and saved activity.
          </p>
          <Button render={<Link href="/" />} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const displayName = profile?.fullName || user.name;
  const areaLabel =
    profile?.areaName ||
    profile?.areaSlug?.replace(/-/g, " ") ||
    null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.avatar}>
          <UserInitials
            name={displayName}
            email={user.email}
            size="lg"
          />
        </div>
        <h1 className={styles.title}>{displayName}</h1>
        <p className={styles.email}>{user.email}</p>

        {profileLoading ? (
          <p className={styles.subtitle}>Loading profile…</p>
        ) : null}

        {!profileLoading && areaLabel ? (
          <p className={styles.subtitle}>
            <MapPin className="inline size-4 mr-1" aria-hidden />
            {areaLabel}
            {profile?.pincode ? ` · ${profile.pincode}` : ""}
          </p>
        ) : null}

        {!profileLoading && profile?.durationLived ? (
          <p className={styles.subtitle}>
            Lived: {profile.durationLived}
            {profile.isCurrentResident ? " (current resident)" : ""}
          </p>
        ) : null}

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
          onClick={async () => {
            await logout();
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

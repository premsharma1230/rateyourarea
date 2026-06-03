"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useToast } from "@/components/ui/ToastProvider";

const AUTH_ERROR_MESSAGES = {
  missing_code: "Google sign-in was cancelled.",
  not_configured: "Login is not configured yet. Contact support.",
  exchange_failed: "Google sign-in failed. Try again.",
};

export default function AuthUrlHandler() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (!auth) return;

    if (auth === "error") {
      const reason = searchParams.get("reason");
      showToast(
        AUTH_ERROR_MESSAGES[reason] || "Sign-in failed. Please try again.",
        "error"
      );
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth");
    params.delete("reason");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, pathname, router, showToast]);

  return null;
}

import { Suspense } from "react";

import ExplorePageClient from "@/components/explore/ExplorePageClient";

export const metadata = {
  title: "Explore Areas | RateYourArea",
  description:
    "Browse societies, sectors, PGs and flats in Gurugram — rated by real residents.",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExplorePageClient />
    </Suspense>
  );
}

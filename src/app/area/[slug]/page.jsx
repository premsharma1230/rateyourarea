import { getAreaBySlug, areas } from "@/data/areas";
import AreaPageClient from "@/components/area/AreaPageClient";

export function generateStaticParams() {
  return areas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) {
    return {
      title: "Area Reviews | RateYourArea",
      description: "Read anonymous reviews from real residents.",
    };
  }
  return {
    title: `${area.name} Reviews | RateYourArea`,
    description: area.description,
  };
}

export default async function AreaPage({ params }) {
  const { slug } = await params;
  const staticArea = getAreaBySlug(slug);

  return <AreaPageClient slug={slug} staticArea={staticArea ?? null} />;
}

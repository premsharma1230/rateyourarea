import EntityPageClient from "@/components/entity/EntityPageClient";

export async function generateMetadata({ params, searchParams }) {
  const { type, slug } = await params;
  const { area } = await searchParams;
  const name = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: `${name} Reviews | RateYourArea`,
    description: `Read resident reviews for ${name}${area ? ` in ${area}` : ""}.`,
  };
}

export default async function EntityPage({ params, searchParams }) {
  const { type, slug } = await params;
  const { area: areaSlug } = await searchParams;

  return (
    <EntityPageClient
      type={type}
      slug={slug}
      areaSlug={areaSlug || null}
    />
  );
}

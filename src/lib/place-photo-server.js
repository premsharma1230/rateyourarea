import { resolveEntityImage } from "@/lib/entity-images";

/** Free type-related listing images (no paid APIs). */
export async function resolvePlacePhoto(input) {
  const url = resolveEntityImage({
    image: input.image,
    type: input.type,
    areaSlug: input.slug,
    nameSlug: input.slug,
    name: input.name,
    key: input.slug || input.name,
  });

  return { url, source: "type_stock" };
}

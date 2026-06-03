const PLACEHOLDER_IDS = [
  "photo-1600596542815",
  "photo-1560518883",
];

const TYPE_IMAGE_POOLS = {
  society: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1564013794819-845b47842f47?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80&auto=format&fit=crop",
  ],
  pg: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555854877-8c362fab4106?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format&fit=crop",
  ],
  flat: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80&auto=format&fit=crop",
  ],
  sector: [
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&auto=format&fit=crop",
  ],
  locality: [
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format&fit=crop",
  ],
};

const DEFAULT_POOL = TYPE_IMAGE_POOLS.society;

function hashKey(str) {
  let h = 0;
  const s = String(str || "default");
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function isPlaceholderImage(url) {
  if (!url || typeof url !== "string") return true;
  return PLACEHOLDER_IDS.some((id) => url.includes(id));
}

/** Only URLs Next/Image can load reliably in this app */
export function isUsableImageUrl(url) {
  if (!url?.trim() || isPlaceholderImage(url)) return false;

  try {
    const host = new URL(url).hostname;
    return (
      host === "images.unsplash.com" ||
      host.endsWith(".supabase.co") ||
      host === "lh3.googleusercontent.com"
    );
  } catch {
    return false;
  }
}

export function pickImageForType(type, key) {
  const pool = TYPE_IMAGE_POOLS[type] || DEFAULT_POOL;
  return pool[hashKey(key) % pool.length];
}

/** Listing card image: DB URL → type-related stock photo */
export function resolveEntityImage(entity) {
  const stored = entity?.image?.trim();
  if (stored && isUsableImageUrl(stored)) {
    return stored;
  }

  const key =
    entity?.areaSlug ||
    entity?.slug ||
    entity?.nameSlug ||
    entity?.key ||
    entity?.name ||
    "entity";

  return pickImageForType(entity?.type, key);
}

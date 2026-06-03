/** @type {import('next').NextConfig} */

function getSupabaseImageHost() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !url.startsWith("http")) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = getSupabaseImageHost();
const imageRemotePatterns = [
  {
    protocol: "https",
    hostname: "lh3.googleusercontent.com",
  },
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
  {
    protocol: "https",
    hostname: "picsum.photos",
  },
  {
    protocol: "https",
    hostname: "staticmap.openstreetmap.de",
  },
  {
    protocol: "https",
    hostname: "upload.wikimedia.org",
  },
];

if (supabaseHost) {
  imageRemotePatterns.push({
    protocol: "https",
    hostname: supabaseHost,
  });
}

const nextConfig = {
  sassOptions: {
    includePaths: ["./src"],
  },
  images: {
    remotePatterns: imageRemotePatterns,
  },
};

module.exports = nextConfig;

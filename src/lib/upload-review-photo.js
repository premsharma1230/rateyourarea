import { supabase } from "@/backend/lib/supabase";
import { isSupabaseConfigured } from "@/backend/lib/config";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateReviewPhotoFile(file) {
  if (!file) return { ok: false, error: "No file selected" };
  if (!ALLOWED.has(file.type)) {
    return { ok: false, error: "Use JPG, PNG, or WebP only" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Image must be under 3 MB" };
  }
  return { ok: true };
}

export async function uploadReviewPhoto(file) {
  const check = validateReviewPhotoFile(file);
  if (!check.ok) {
    throw new Error(check.error);
  }

  if (!isSupabaseConfigured()) {
    return URL.createObjectURL(file);
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `reviews/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("review-photos")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw new Error(error.message || "Upload failed");
  }

  const { data } = supabase.storage.from("review-photos").getPublicUrl(path);
  return data.publicUrl;
}

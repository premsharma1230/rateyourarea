import { areas } from "@/data/areas";
import { slugify } from "@/lib/client-db";
import { supabase } from "@/backend/lib/supabase";

export function formatResidentSince(duration, isCurrentResident) {
  const durationText = duration?.trim() || "";
  if (durationText && isCurrentResident) {
    return `${durationText} (current resident)`;
  }
  if (durationText) return durationText;
  if (isCurrentResident) return "Current resident";
  return "";
}

function normalizeFromDbRow(row) {
  if (!row) return null;
  return {
    fullName: row.full_name ?? null,
    areaName: row.area_name ?? null,
    areaSlug: row.area_slug ?? null,
    pincode: row.pincode ?? null,
    durationLived: row.duration_lived ?? null,
    isCurrentResident: Boolean(row.is_current_resident),
    residentSince: row.resident_since ?? null,
    isVerified: Boolean(row.is_verified),
    onboardingStatus: row.onboarding_status ?? null,
  };
}

function normalizeFromUserMetadata(meta) {
  if (!meta || typeof meta !== "object") return null;

  const durationLived = meta.duration_lived?.trim?.() ?? meta.duration_lived ?? null;
  const isCurrentResident = Boolean(meta.is_current_resident);

  return {
    fullName: meta.full_name ?? null,
    areaName: meta.area_name ?? null,
    areaSlug: meta.area_slug ?? null,
    pincode: meta.pincode ?? null,
    durationLived: durationLived || null,
    isCurrentResident,
    residentSince:
      meta.resident_since ??
      (formatResidentSince(durationLived, isCurrentResident) || null),
    isVerified: Boolean(meta.is_verified),
    onboardingStatus: meta.onboarding_status ?? null,
  };
}

/** GET profile — signup data from profiles row or auth user_metadata */
export async function getProfile(userId) {
  if (!userId) {
    return { data: null, error: new Error("User id is required") };
  }

  const { data: row, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (row) {
    return { data: normalizeFromDbRow(row), error: null };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { data: null, error: userError };
  }

  if (!user || user.id !== userId) {
    return { data: null, error: null };
  }

  return {
    data: normalizeFromUserMetadata(user.user_metadata || {}),
    error: null,
  };
}

export function resolveAreaSlug(areaText) {
  if (!areaText?.trim()) return null;

  const trimmed = areaText.trim();
  const lower = trimmed.toLowerCase();

  const byName = areas.find((a) => a.name.toLowerCase() === lower);
  if (byName) return byName.slug;

  const slug = slugify(trimmed);
  const bySlug = areas.find((a) => a.slug === slug);
  if (bySlug) return bySlug.slug;

  return slug || null;
}

function isMissingColumnError(error) {
  const message = error?.message?.toLowerCase() || "";
  const code = error?.code || "";
  return (
    code === "PGRST204" ||
    message.includes("column") ||
    message.includes("schema cache")
  );
}

function buildProfileRow(
  userId,
  {
    fullName,
    areaName,
    areaSlug,
    pincode,
    durationLived,
    isCurrentResident,
    onboardingStatus,
    residentSince,
    isVerified,
    verificationType,
  } = {},
  { includeExtended = true } = {}
) {
  const row = { id: userId };

  if (fullName?.trim()) row.full_name = fullName.trim();
  if (areaSlug) row.area_slug = areaSlug;
  if (pincode?.trim()) row.pincode = pincode.trim();

  const residentSinceText = residentSince?.trim();
  if (residentSinceText) row.resident_since = residentSinceText;

  if (typeof isVerified === "boolean") row.is_verified = isVerified;
  if (verificationType) row.verification_type = verificationType;

  if (includeExtended) {
    if (areaName?.trim()) row.area_name = areaName.trim();
    if (durationLived?.trim()) row.duration_lived = durationLived.trim();
    if (typeof isCurrentResident === "boolean") {
      row.is_current_resident = isCurrentResident;
    }
    if (onboardingStatus) row.onboarding_status = onboardingStatus;
  }

  return row;
}

export async function upsertProfile(userId, profileFields = {}) {
  if (!userId) {
    return { data: null, error: new Error("User id is required") };
  }

  const fullRow = buildProfileRow(userId, profileFields, {
    includeExtended: true,
  });

  if (Object.keys(fullRow).length === 1) {
    return { data: null, error: null };
  }

  let { data, error } = await supabase
    .from("profiles")
    .upsert(fullRow, { onConflict: "id" })
    .select()
    .single();

  if (error && isMissingColumnError(error)) {
    const coreRow = buildProfileRow(userId, profileFields, {
      includeExtended: false,
    });

    if (Object.keys(coreRow).length === 1) {
      return { data: null, error: null };
    }

    ({ data, error } = await supabase
      .from("profiles")
      .upsert(coreRow, { onConflict: "id" })
      .select()
      .single());
  }

  return { data, error };
}

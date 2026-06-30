"use server";

import type { SupabaseClient, User } from "@supabase/supabase-js";

type EnsureUserProfileInput = {
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
};

function getFallbackFullName(user: User) {
  const metadataName = user.user_metadata?.full_name;

  if (typeof metadataName === "string" && metadataName.trim().length > 0) {
    return metadataName.trim();
  }

  return user.email?.split("@")[0] ?? "Pengguna CircleTask";
}

function getFallbackAvatarUrl(user: User) {
  const metadataAvatarUrl = user.user_metadata?.avatar_url;

  if (typeof metadataAvatarUrl === "string" && metadataAvatarUrl.trim().length > 0) {
    return metadataAvatarUrl.trim();
  }

  return null;
}

function getProfileEmail(user: User, input: EnsureUserProfileInput) {
  const email = input.email?.trim() || user.email?.trim();

  if (!email) {
    throw new Error("Email pengguna tidak tersedia.");
  }

  return email;
}

export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User,
  input: EnsureUserProfileInput = {}
) {
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    throw new Error(existingProfileError.message);
  }

  const fullName = input.fullName?.trim() || getFallbackFullName(user);
  const email = getProfileEmail(user, input);
  const avatarUrl = input.avatarUrl ?? getFallbackAvatarUrl(user);

  if (existingProfile) {
    const profileUpdates: {
      email?: string;
      full_name?: string;
      avatar_url?: string | null;
    } = {};

    if (existingProfile.email !== email) {
      profileUpdates.email = email;
    }

    if (input.fullName) {
      profileUpdates.full_name = fullName;
    }

    if (input.avatarUrl !== undefined) {
      profileUpdates.avatar_url = avatarUrl;
    }

    if (Object.keys(profileUpdates).length === 0) {
      return;
    }

    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("user_id", user.id);

    if (updateProfileError) {
      throw new Error(updateProfileError.message);
    }

    return;
  }

  const { error: insertProfileError } = await supabase.from("profiles").insert({
    user_id: user.id,
    full_name: fullName,
    email,
    avatar_url: avatarUrl,
  });

  if (insertProfileError) {
    throw new Error(insertProfileError.message);
  }
}

"use server";

import { Profile } from "@/types";
import { createClient } from "@/utils/supabase/server";

export async function getProfileByUsername(
  username: string
): Promise<{ data: Profile | null; error: any }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, role")
    .eq("username", username)
    .maybeSingle();

  return { data: data as Profile | null, error };
}

export async function createProfileIfNotExists(
  id: number,
  username: string,
  fullName: string | null
): Promise<{ error: any }> {
  const supabase = await createClient();

  // Check if profile exists
  const { data: existingProfile, error: checkError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "no rows returned", which is expected if profile doesn't exist
    return { error: checkError };
  }

  // If profile doesn't exist, create it
  if (!existingProfile) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id,
      username: username,
      full_name: fullName,
    });

    return { error: insertError };
  }

  return { error: null };
}

/**
 * Get profile by user ID
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data as Profile;
}

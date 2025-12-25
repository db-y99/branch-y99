"use server";

import { createClient } from "@/utils/supabase/server";

export async function updateApplicationRecordBranch(
  applicationId: string,
  branch_uuid: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("application_records")
    .update({ branch_uuid })
    .eq("id", applicationId);

  if (error) {
    console.error("Error updating branch_uuid:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

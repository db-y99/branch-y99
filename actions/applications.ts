"use server";

import { UpdateApplicationNoteParams } from "@/types";
import { createClient } from "@/utils/supabase/server";

export async function updateApplicationNote(
  params: UpdateApplicationNoteParams
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { id, loginId, ...body } = params;

  const url = `${apiUrl}/data-detail/Application/${id}/?login=${loginId}`;

  try {
    // Try POST with _method in body, some APIs require this
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message || `API call failed with status: ${response.status}`
      );
    }

    const { error } = await supabase
      .from("application_records")
      .update({ note: body.note })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating application note:", error);

    return { success: false, error: error.message || "Failed to update note" };
  }
}

"use server";

import { UpdateApplicationNoteParams } from "@/types";

export async function updateApplicationNote(
  params: UpdateApplicationNoteParams,
): Promise<{ success: boolean; error?: string }> {
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
        errorData.message || `API call failed with status: ${response.status}`,
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating application note:", error);

    return { success: false, error: error.message || "Failed to update note" };
  }
}

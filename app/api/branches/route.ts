import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: branches, error } = await supabase
      .from("branches")
      .select("id, name, code")
      .is("deleted_at", null)
      .order("name");

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      rows: branches || [],
    });
  } catch (error: any) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

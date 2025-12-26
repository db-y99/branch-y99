import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const loginId = searchParams.get("loginId");
  const filter = JSON.parse(searchParams.get("filter") || "{}") as Record<
    string,
    any
  >;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL not configured" },
      { status: 500 }
    );
  }

  const values =
    "id,application,content,signature,user,user__fullname,signature__file,status,status__code,status__name,user,link,document,create_time,update_time";

  const url = `${apiUrl}/data/Contract/?values=${values}&filter=${encodeURIComponent(JSON.stringify(filter))}&login=${loginId}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed with status ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching contract data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

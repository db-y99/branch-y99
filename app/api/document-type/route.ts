import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { searchParams } = new URL(request.url);
  const loginId = searchParams.get("loginId");

  const filterObj: Record<string, any> = {
    create_time__date__gte: "1927-05-29",
  };

  const url = `${apiUrl}/data/Document_Type/?sort=index&filter=${encodeURIComponent(JSON.stringify(filterObj))}&login=${loginId}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching document type data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


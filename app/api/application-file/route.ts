import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { searchParams } = new URL(request.url);
  const loginId = searchParams.get("loginId");
  const ref = searchParams.get("ref");

  const filterObj: Record<string, any> = {
    ref: ref,
  };

  const url = `${apiUrl}/data/Application_File/?values=id,ref,file,file__name,file__file,file__type__code,file__type__name,file__doc_type__code,file__doc_type__name,file__doc_type__en&filter=${encodeURIComponent(JSON.stringify(filterObj))}&login=${loginId}`;

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
    console.error("Error fetching application data:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

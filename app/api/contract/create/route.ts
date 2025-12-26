import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const loginId = searchParams.get("loginId");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!code || !loginId) {
    return NextResponse.json(
      { error: "Missing code or loginId" },
      { status: 400 }
    );
  }

  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL not configured" },
      { status: 500 }
    );
  }

  const url = `${apiUrl}/create-contract/?code=${encodeURIComponent(code)}&login=${loginId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`Create contract failed ${response.status}:`, errorText);
      throw new Error(
        `Create contract failed ${response.status}: ${errorText}`
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create contract" },
      { status: 500 }
    );
  }
}

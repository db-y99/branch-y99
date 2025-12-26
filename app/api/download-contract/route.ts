import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filename = searchParams.get("filename");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!filename) {
    return NextResponse.json(
      { error: "Missing filename or loginId" },
      { status: 400 }
    );
  }

  if (!apiUrl) {
    return NextResponse.json(
      { error: "API_URL not configured" },
      { status: 500 }
    );
  }

  const fileUrl = `${apiUrl}/download-contract/${filename}`;

  try {
    const res = await fetch(fileUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error(`Download failed ${res.status}:`, errorText);
      throw new Error(`Download failed ${res.status}: ${errorText}`);
    }

    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Download failed" },
      { status: 500 }
    );
  }
}

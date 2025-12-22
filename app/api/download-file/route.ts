import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");
  const loginId = searchParams.get("loginId");

  if (!loginId) {
    return NextResponse.json(
      { error: "Login ID is required" },
      { status: 400 },
    );
  }

  if (!filePath) {
    return NextResponse.json(
      { error: "File path is required" },
      { status: 400 },
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const fileUrl = `${apiUrl}/static/files/${filePath}`;

  try {
    const response = await fetch(fileUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }

    const blob = await response.blob();
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // Extract filename from path
    const filename = filePath.split("/").pop() || "file";

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error downloading file:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

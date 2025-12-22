import { NextResponse } from "next/server";
import archiver from "archiver";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filePaths, loginId, folderName } = body;

    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return NextResponse.json(
        { error: "File paths array is required" },
        { status: 400 },
      );
    }

    if (!loginId) {
      return NextResponse.json(
        { error: "Login ID is required" },
        { status: 400 },
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Create a zip archive
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Create a readable stream for the response
    const stream = new ReadableStream({
      start(controller) {
        archive.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        archive.on("end", () => {
          controller.close();
        });

        archive.on("error", (err) => {
          controller.error(err);
        });
      },
    });

    // Fetch and add each file to the archive
    for (const filePath of filePaths) {
      try {
        const fileUrl = `${apiUrl}/static/files/${filePath}`;
        const response = await fetch(fileUrl, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const fileName = filePath.split("/").pop() || filePath;

          archive.append(buffer, { name: fileName });
        }
      } catch (error) {
        console.error(`Error fetching file ${filePath}:`, error);
        // Continue with other files even if one fails
      }
    }

    // Finalize the archive
    archive.finalize();

    const zipFileName = folderName || "files.zip";

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFileName}"`,
      },
    });
  } catch (error: any) {
    console.error("Error creating zip file:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

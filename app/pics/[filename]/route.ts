import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (filename.includes("/") || filename.includes("\\")) {
    return new NextResponse("Invalid file path", { status: 400 });
  }

  const extension = path.extname(filename).toLowerCase();
  const contentType = contentTypes[extension];

  if (!contentType) {
    return new NextResponse("Unsupported file type", { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), "pics", filename);
    const file = await readFile(filePath);

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sourcesDir = path.join(process.cwd(), "sources");
    if (!fs.existsSync(sourcesDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(sourcesDir);
    const sourceFiles = files.map(file => ({
      name: file,
      size: fs.statSync(path.join(sourcesDir, file)).size,
      updatedAt: fs.statSync(path.join(sourcesDir, file)).mtime,
    }));

    return NextResponse.json(sourceFiles);
  } catch (error) {
    console.error("Error listing sources:", error);
    return NextResponse.json({ error: "Failed to list sources" }, { status: 500 });
  }
}

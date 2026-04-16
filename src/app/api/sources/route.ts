import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || "");
    const sources = await sql`SELECT title as name, length(content) as size, updated_at as "updatedAt" FROM sources ORDER BY updated_at DESC`;
    return NextResponse.json(sources);
  } catch (error) {
    console.error("Error listing sources:", error);
    return NextResponse.json({ error: "Failed to list sources" }, { status: 500 });
  }
}

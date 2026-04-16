import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL || "");
    const sources = await sql`SELECT id, title, content FROM sources ORDER BY updated_at DESC`;
    return NextResponse.json(sources);
  } catch(error) {
    return NextResponse.json({ error: "Failed to list admin sources" }, { status: 500 });
  }
}

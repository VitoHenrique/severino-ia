import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(req: Request) {
  try {
    const { id, title, content } = await req.json();
    const sql = neon(process.env.DATABASE_URL || "");
    
    if (id) {
      // Update by ID
      await sql`UPDATE sources SET title = ${title}, content = ${content}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
    } else {
      // Insert new
      await sql`INSERT INTO sources (title, content) VALUES (${title}, ${content}) ON CONFLICT (title) DO UPDATE SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP`;
    }
    
    return NextResponse.json({ success: true });
  } catch(error: any) {
    console.error("API Admin Source Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");
    if (!idStr) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    const id = parseInt(idStr, 10);
    const sql = neon(process.env.DATABASE_URL || "");
    await sql`DELETE FROM sources WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch(error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (password === (process.env.ADMIN_PASSWORD || "admin")) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      return response;
    }
    return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: "Erro de servidor" }, { status: 500 });
  }
}

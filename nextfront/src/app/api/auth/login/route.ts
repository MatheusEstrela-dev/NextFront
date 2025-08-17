import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-super-secret");

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });

    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(String(user.id))
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const res = NextResponse.json({ ok: true, role: user.role });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error("LOGIN_ERROR", e);
    return NextResponse.json({ error: "Erro ao autenticar." }, { status: 500 });
  }
}

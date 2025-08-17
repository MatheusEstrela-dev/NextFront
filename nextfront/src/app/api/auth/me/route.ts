import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-super-secret");

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const id = Number(payload.sub);
    if (!id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, state: true, city: true, createdAt: true, role: true },
    });
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
}

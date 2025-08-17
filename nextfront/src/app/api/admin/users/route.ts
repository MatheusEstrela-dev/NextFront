import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// GET /api/admin/users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        state: true,
        city: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}

// POST /api/admin/users
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, password, role, state, city } = data;

    // Validação básica
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Verifica se email já existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        password: hashedPassword,
        role: role || "USER",
        state: state?.trim(),
        city: city?.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        state: true,
        city: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[ADMIN_USERS_POST]", error);
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}

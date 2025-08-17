import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET não é necessário pois já temos a lista completa
// PUT /api/admin/users/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const data = await req.json();
    const { name, email, role, state, city } = data;

    // Validação básica
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Verifica se email já existe (exceto para o usuário atual)
    const existing = await prisma.user.findFirst({
      where: { 
        email,
        NOT: { id }
      }
    });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    // Verifica se está tentando editar o admin
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
      select: { email: true }
    });

    if (userToUpdate?.email === "admin@abrasel.com") {
      return NextResponse.json({ error: "Não é possível editar o administrador" }, { status: 403 });
    }

    // Atualizar usuário
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: name.trim(),
        email: email.trim(),
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
    console.error("[ADMIN_USERS_PUT]", error);
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verifica se está tentando deletar o admin
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { email: true }
    });

    if (userToDelete?.email === "admin@abrasel.com") {
      return NextResponse.json({ error: "Não é possível excluir o administrador" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ADMIN_USERS_DELETE]", error);
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
  }
}

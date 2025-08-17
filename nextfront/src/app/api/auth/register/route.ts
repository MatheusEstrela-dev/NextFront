import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

type ViaCEP = { erro?: boolean; uf?: string; localidade?: string };

function validatePassword(pwd: string) {
  // regra simples: 8+, 1 maiúscula, 1 número
  return pwd.length >= 8 && /[A-Z]/.test(pwd) && /\d/.test(pwd);
}

export async function POST(req: Request) {
  try {
    const { name, email, password, cep } = await req.json();

    // validações básicas
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Senha fraca (mín. 8, 1 maiúscula, 1 número)." },
        { status: 400 }
      );
    }

    // checa duplicidade
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    }

    // resolve estado/cidade via CEP (opcional)
    let state: string | undefined;
    let city: string | undefined;

    if (cep) {
      const onlyDigits = String(cep).replace(/\D/g, "");
      if (onlyDigits.length === 8) {
        const r = await fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`, { cache: "no-store" });
        if (r.ok) {
          const data: ViaCEP = await r.json();
          if (!data.erro) {
            state = data.uf;
            city = data.localidade;
          }
        }
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        cep: cep ?? null,
        state: state ?? null,
        city: city ?? null,
        // role padrão "user" (defina no schema)
      },
      select: { id: true, name: true, email: true, state: true, city: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao registrar." }, { status: 500 });
  }
}

export const runtime = "nodejs";

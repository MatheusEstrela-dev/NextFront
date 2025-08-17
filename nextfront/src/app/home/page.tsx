"use client";

import { LogOut, Mail, MapPin, User2 } from "lucide-react";
import { useEffect, useState } from "react";

type MeResp = {
  user: { id: number; name: string; email: string; state: string | null; city: string | null; createdAt: string };
};

export default function HomePage() {
  const [me, setMe] = useState<MeResp["user"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      if (r.status !== 200) {
        // se não estiver logado, volta p/ login
        window.location.href = "/";
        return;
      }
      const data: MeResp = await r.json();
      setMe(data.user);
      setLoading(false);
    })();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/"; // volta para login
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 text-white">
        <div className="animate-pulse text-white/80">carregando…</div>
      </div>
    );
  }

  if (!me) return null;

  const firstName = me.name?.split(" ")[0] ?? "Usuário";

  return (
    <main className="min-h-screen relative text-white">
      {/* fundo bonito */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

      {/* topo / navbar */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
              <User2 size={16} className="text-white/80" />
            </span>
            NextFront
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 transition shadow-lg shadow-sky-900/30"
            title="Sair"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* conteúdo */}
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* hero */}
        <section className="rounded-3xl p-6 bg-white/5 ring-1 ring-white/10 backdrop-blur-md shadow-[0_8px_60px_-10px_rgba(0,0,0,.4)]">
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Bem-vindo, {firstName} <span className="inline-block animate-pulse">👋</span>
          </h1>
          <p className="mt-1 text-white/80 flex items-center gap-2">
            <Mail size={16} className="text-white/60" />
            Você está logado como <span className="font-medium">{me.email}</span>
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Info label="Estado" value={me.state ?? "—"} />
            <Info label="Cidade" value={me.city ?? "—"} />
            <Info label="Desde" value={new Date(me.createdAt).toLocaleDateString()} />
          </div>
        </section>

        {/* cards */}
        <section className="grid gap-4 sm:grid-cols-3">
          <Card title="Usuários" value="—" />
          <Card title="Pedidos" value="—" />
          <Card title="Faturamento" value="—" />
        </section>

        {/* bloco extra de exemplo */}
        <section className="rounded-3xl p-6 bg-white/5 ring-1 ring-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-white/80">
            <MapPin size={16} className="text-white/60" />
            <span>
              {me.city ?? "—"}{me.state ? `, ${me.state}` : ""}
            </span>
          </div>
          <p className="mt-2 text-white/70 text-sm">
            Localização baseada no IP fornecido pelo navegador atual.
          </p>
        </section>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
      <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
      <div className="text-lg">{value}</div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl p-5 bg-white/5 ring-1 ring-white/10 backdrop-blur shadow-[0_6px_40px_-12px_rgba(0,0,0,.45)]">
      <div className="text-sm text-white/70">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

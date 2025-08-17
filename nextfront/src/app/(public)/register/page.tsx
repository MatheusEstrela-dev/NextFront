"use client";
import { useState } from "react";

type Form = {
  name: string;
  email: string;
  password: string;
  confirm: string;
  cep?: string;
  state?: string;
  city?: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<Form>({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const update = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function lookupCEP() {
    const cepDigits = (form.cep || "").replace(/\D/g, "");
    if (cepDigits.length !== 8) {
      setMsg("CEP deve ter 8 dígitos.");
      return;
    }
    setMsg(null);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const j = await r.json();
      if (j.erro) {
        setMsg("CEP não encontrado.");
      } else {
        setForm((f) => ({ ...f, state: j.uf || "", city: j.localidade || "" }));
      }
    } catch {
      setMsg("Falha ao consultar CEP.");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (form.password !== form.confirm) {
      setMsg("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          cep: form.cep?.trim() || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setMsg(data?.error ?? "Erro no cadastro.");
      } else {
        setMsg("Cadastro realizado! Você já pode entrar.");
        // opcional: redirect para /login
        // window.location.href = "/login";
      }
    } catch {
      setMsg("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-black/60 rounded-2xl p-6 space-y-3">
        <h1 className="text-xl font-semibold text-white">Register</h1>

        <input className="input" placeholder="Nome completo" value={form.name} onChange={update("name")} />
        <input className="input" placeholder="E-mail" value={form.email} onChange={update("email")} />
        <input className="input" placeholder="Senha" type="password" value={form.password} onChange={update("password")} />
        <input className="input" placeholder="Confirmar senha" type="password" value={form.confirm} onChange={update("confirm")} />

        <div className="pt-2 text-sm text-gray-400">Campos Opcionais</div>

        <div className="flex gap-2">
          <input className="input flex-1" placeholder="CEP (apenas números)" value={form.cep || ""} onChange={update("cep")} />
          <button type="button" onClick={lookupCEP} className="btn px-3" disabled={loading}>🔎</button>
        </div>

        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Estado" value={form.state || ""} onChange={update("state")} disabled />
          <input className="input flex-1" placeholder="Cidade" value={form.city || ""} onChange={update("city")} disabled />
        </div>

        {msg && <p className="text-sm text-amber-300">{msg}</p>}

        <button className="btn w-full" disabled={loading}>{loading ? "Enviando..." : "Register"}</button>
      </form>
    </main>
  );
}

"use client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye, EyeOff,
  Home, Landmark,
  Lock,
  LogIn,
  Mail, MapPin, Search,
  User2,
  UserPlus
} from "lucide-react";
import React, { FormEvent, useState } from "react";

type AuthMode = "signin" | "register";

function validatePassword(pwd: string) {
  return pwd.length >= 8 && /[A-Z]/.test(pwd) && /\d/.test(pwd);
}

export default function HomePage() {
  const [authMode, setAuthMode] = useState<AuthMode>("register");

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  async function lookupCEP() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setMessage("CEP deve ter 8 dígitos.");
      return;
    }
    setMessage("");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const j = await r.json();
      if (j?.erro) {
        setMessage("CEP não encontrado.");
        return;
      }
      setEstado(j.uf || "");
      setCidade(j.localidade || "");
    } catch {
      setMessage("Falha ao consultar CEP.");
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (authMode === "register") {
        if (!name.trim() || name.trim().length < 2) {
          setMessage("Nome inválido.");
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setMessage("E-mail inválido.");
          return;
        }
        if (password !== confirmPassword) {
          setMessage("As senhas não coincidem.");
          return;
        }
        if (!validatePassword(password)) {
          setMessage("Senha fraca (mín. 8, 1 maiúscula e 1 número).");
          return;
        }

        const resp = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            cep: cep?.trim() || undefined,
          }),
        });

        const data = await resp.json();
        if (!resp.ok) {
          setMessage(data?.error ?? "Erro ao registrar.");
          return;
        }

        setMessage("✅ Cadastro realizado! Você já pode entrar.");
      } else {
        // LOGIN
        const resp = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await resp.json();
        if (!resp.ok) {
          setMessage(data?.error ?? "Erro ao entrar.");
          return;
        }

        // 🚀 Se admin → vai para /admin, senão → /home
        if (data.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/home";
        }
      }
    } catch {
      setMessage("Erro de rede. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />

      {/* card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-[min(92vw,480px)] rounded-3xl p-6 bg-slate-900/70 backdrop-blur-md shadow-[0_8px_60px_-10px_rgba(0,0,0,0.55)] ring-1 ring-white/10 text-white"
      >
        {/* avatar */}
        <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-white/10 grid place-items-center ring-1 ring-white/15">
          <User2 size={28} className="text-white/80" />
        </div>

        {/* tabs */}
        <div className="relative mb-6 grid grid-cols-2 text-sm">
          {(["signin", "register"] as AuthMode[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setAuthMode(tab)}
              className={`flex items-center justify-center gap-2 px-4 py-2 transition-colors ${
                authMode === tab ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              {tab === "signin" ? <LogIn size={16} /> : <UserPlus size={16} />}
              {tab === "signin" ? "Login" : "Cadastro"}
            </button>
          ))}
          {/* animated underline */}
          <motion.span
            className="absolute bottom-0 h-[2px] bg-sky-400 rounded-full"
            initial={false}
            animate={{ left: authMode === "signin" ? "0%" : "50%", width: "50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        {/* forms */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <AnimatePresence mode="wait">
            {authMode === "register" ? (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                className="space-y-3"
              >
                <Field icon={<User2 size={16} />} placeholder="Nome completo">
                  <input
                    className="w-full bg-transparent outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                  />
                </Field>
                <Field icon={<Mail size={16} />} placeholder="E-mail">
                  <input
                    className="w-full bg-transparent outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                  />
                </Field>

                <Field icon={<Lock size={16} />} placeholder="Senha" end={
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="text-white/60 hover:text-white transition"
                    aria-label={showPwd ? "Esconder senha" : "Mostrar senha"}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }>
                  <input
                    className="w-full bg-transparent outline-none"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                  />
                </Field>

                <Field icon={<Lock size={16} />} placeholder="Confirmar senha">
                  <input
                    className="w-full bg-transparent outline-none"
                    type={showPwd ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar senha"
                  />
                </Field>

                <div className="pt-1 text-xs text-white/60 text-center select-none">
                  Campos Opcionais
                </div>

                <div className="flex gap-2">
                  <Field className="flex-1" icon={<MapPin size={16} />} placeholder="CEP (apenas números)">
                    <input
                      className="w-full bg-transparent outline-none"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      placeholder="CEP (apenas números)"
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={lookupCEP}
                    className="px-3 rounded-xl bg-sky-600 hover:bg-sky-500 transition disabled:opacity-50 grid place-items-center"
                    disabled={isLoading}
                    title="Buscar CEP"
                  >
                    <Search size={18} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <Field className="flex-1" icon={<Landmark size={16} />} placeholder="Estado">
                    <input
                      className="w-full bg-transparent outline-none"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      placeholder="Estado"
                      disabled
                    />
                  </Field>
                  <Field className="flex-1" icon={<Home size={16} />} placeholder="Cidade">
                    <input
                      className="w-full bg-transparent outline-none"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Cidade"
                      disabled
                    />
                  </Field>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.22 }}
                className="space-y-3"
              >
                <Field icon={<Mail size={16} />} placeholder="E-mail">
                  <input
                    className="w-full bg-transparent outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail"
                  />
                </Field>
                <Field icon={<Lock size={16} />} placeholder="Senha" end={
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="text-white/60 hover:text-white transition"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }>
                  <input
                    className="w-full bg-transparent outline-none"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          {message && (
            <p className="text-sm text-amber-300 pt-1">{message}</p>
          )}

          <button
            className="w-full mt-1 rounded-xl px-4 py-3 font-semibold bg-sky-600 hover:bg-sky-500 active:bg-sky-600 transition disabled:opacity-50 shadow-lg shadow-sky-900/30"
            disabled={isLoading}
          >
            {authMode === "register"
              ? (isLoading ? "Enviando..." : "Cadastro")
              : (isLoading ? "Entrando..." : "Login")}
          </button>
        </form>
      </motion.div>
    </main>
  );
}

/* ---------------------- UI helper ---------------------- */
function Field({
  icon,
  placeholder,
  end,
  className = "",
  children,
}: {
  icon?: React.ReactNode;
  placeholder?: string;
  end?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 ring-0 transition
      focus-within:border-sky-400/60 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-sky-400/30 ${className}`}
      title={placeholder}
    >
      {icon && <span className="text-white/70">{icon}</span>}
      <div className="flex-1">{children}</div>
      {end}
    </label>
  );
}

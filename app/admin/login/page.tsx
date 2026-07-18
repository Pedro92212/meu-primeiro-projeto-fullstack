"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setCarregando(true);
    setErro(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    setCarregando(false);
    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-margin-mobile bg-background">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-xl p-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-surface-container">
        <h1 className="font-h1 text-h1 mb-1 text-primary">Painel Admin</h1>
        <p className="text-on-surface-variant text-body mb-lg">
          Barbearia do Pedro
        </p>

        <div className="space-y-md">
          <div>
            <label className="font-label text-label text-on-surface-variant ml-1">
              E-mail
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full h-12 px-md rounded-xl border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all mt-1"
            />
          </div>
          <div>
            <label className="font-label text-label text-on-surface-variant ml-1">
              Senha
            </label>
            <input
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              type="password"
              onKeyDown={(e) => e.key === "Enter" && entrar()}
              className="w-full h-12 px-md rounded-xl border border-outline-variant bg-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all mt-1"
            />
          </div>
          {erro && <p className="text-error text-body">{erro}</p>}
          <button
            onClick={entrar}
            disabled={carregando}
            className="w-full h-12 bg-primary text-white rounded-xl font-button uppercase tracking-widest disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </main>
  );
}
